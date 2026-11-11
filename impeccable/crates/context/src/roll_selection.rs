//! JS: lib/roll-selection.mjs (driven synchronously with sha256 hex).

use crate::catalog::{sha256_hex, WELL_TIERS};
use crate::context::locale_compare;
use serde_json::Value;
use std::collections::{HashMap, HashSet};

pub const COMPOSITION_GRAINS: [&str; 4] = ["product", "flow", "view", "region"];
pub const COMPOSITION_PLATFORMS: [&str; 3] = ["web", "ios", "android"];

fn s<'a>(v: &'a Value, key: &str) -> Option<&'a str> {
    v.get(key).and_then(|x| x.as_str())
}

/// JS: rank(items, input, idFor): sort by digest desc (localeCompare), id asc.
fn rank<T: Clone>(items: &[T], input: &str, id_for: impl Fn(&T) -> String) -> Vec<T> {
    let mut scored: Vec<(T, String, String)> = items
        .iter()
        .map(|it| {
            let id = id_for(it);
            let score = sha256_hex(&format!("{}:{}", input, id));
            (it.clone(), id, score)
        })
        .collect();
    scored.sort_by(|a, b| {
        // hex digests: localeCompare == byte order for [0-9a-f]
        b.2.cmp(&a.2).then_with(|| locale_compare(&a.1, &b.1))
    });
    scored.into_iter().map(|(it, _, _)| it).collect()
}

fn tickets_for_rating(rating: Option<&Value>) -> usize {
    match rating.and_then(|r| r.as_f64()) {
        Some(x) if x == 1.0 => 1,
        Some(x) if x == 2.0 => 2,
        Some(x) if x == 3.0 => 2,
        _ => 2,
    }
}

fn review_field<'a>(v: &'a Value, key: &str) -> Option<&'a Value> {
    v.get("review").filter(|r| !r.is_null()).and_then(|r| r.get(key))
}

#[derive(Clone)]
struct Ticket {
    item: Value,
    ticket: usize,
}

fn challenger_tickets(pool: &[Value]) -> Vec<Ticket> {
    let mut out = Vec::new();
    for c in pool {
        if review_field(c, "breadth").and_then(|b| b.as_str()) == Some("niche") {
            continue;
        }
        let n = tickets_for_rating(review_field(c, "rating"));
        for t in 0..n {
            out.push(Ticket { item: c.clone(), ticket: t });
        }
    }
    out
}

fn composition_tickets(pool: &[Value]) -> Vec<Ticket> {
    let mut out = Vec::new();
    for c in pool {
        let n = tickets_for_rating(review_field(c, "rating"));
        for t in 0..n {
            out.push(Ticket { item: c.clone(), ticket: t });
        }
    }
    out
}

fn mode_allows(concept: &Value, mode: &str) -> bool {
    match review_field(concept, "allowedModes").and_then(|a| a.as_array()) {
        Some(a) if !a.is_empty() => a.iter().any(|m| m.as_str() == Some(mode)),
        _ => true,
    }
}

/// JS: TIER_QUOTAS. Challenger picks per tier, by mode; a mode with no entry
/// takes two from every tier, the draw every mode had before quotas existed.
///
/// Operate draws mostly from the graphic tier. Instrument and atmosphere worlds
/// dealt to working screens became costumes of the tool (dashboards built as
/// terminals and gauge clusters), while timetables, specimens, maps and tables
/// transfer as a system. Keep in parity with impeccable-site's
/// scripts/lib/catalog/roll-selection.mjs.
pub const TIER_QUOTAS: [(&str, [(&str, usize); 3]); 1] =
    [("operate", [("graphic", 5), ("interaction", 1), ("atmosphere", 0)])];
const DEFAULT_TIER_QUOTA: usize = 2;

fn tier_quotas(mode: Option<&str>) -> Option<HashMap<String, usize>> {
    let mode = mode?;
    TIER_QUOTAS
        .iter()
        .find(|(m, _)| *m == mode)
        .map(|(_, quotas)| quotas.iter().map(|(t, q)| (t.to_string(), *q)).collect())
}

/// JS: pickFromFamilies. Up to `count` concepts in ranked order, preferring one
/// from a family not yet picked, then any concept not yet picked. At a count of
/// two this is exactly the first-then-different-family pick of every roll
/// before quotas. `prior` are picks already in the hand, whose families count
/// as taken.
fn pick_from_families(order: &[Value], count: usize, prior: &[Value]) -> Vec<Value> {
    let mut picks: Vec<Value> = Vec::new();
    let mut families: Vec<Value> = prior.iter().map(|c| c.get("familyId").cloned().unwrap_or(Value::Null)).collect();
    let id_of = |c: &Value| s(c, "id").unwrap_or("").to_string();
    while picks.len() < count {
        let picked = |c: &Value| picks.iter().any(|p| id_of(p) == id_of(c));
        let family_of = |c: &Value| c.get("familyId").cloned().unwrap_or(Value::Null);
        let next = order
            .iter()
            .find(|c| !picked(c) && !families.contains(&family_of(c)))
            .or_else(|| order.iter().find(|c| !picked(c)))
            .cloned();
        match next {
            Some(c) => {
                families.push(family_of(&c));
                picks.push(c);
            }
            None => break,
        }
    }
    picks
}

/// JS: rankTier. A tier's pool in ticket order, one entry per concept.
fn rank_tier(pool: &[Value], salt_input: &str) -> Vec<Value> {
    let mut tickets = challenger_tickets(pool);
    if tickets.is_empty() {
        tickets = pool.iter().map(|c| Ticket { item: c.clone(), ticket: 0 }).collect();
    }
    let ranked = rank(&tickets, salt_input, |e| format!("{}#{}", s(&e.item, "id").unwrap_or(""), e.ticket));
    let mut ordered: Vec<Value> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    for e in ranked {
        let id = s(&e.item, "id").unwrap_or("").to_string();
        if seen.insert(id) {
            ordered.push(e.item);
        }
    }
    ordered
}

pub struct ChallengerSelection {
    pub approved: Vec<Value>,
    pub picks: Vec<Value>,
}

/// JS: selectApprovedChallengers
pub fn select_approved_challengers(
    scope: &str,
    key: &str,
    reroll: usize,
    mode: Option<&str>,
    concepts: &[Value],
) -> Result<ChallengerSelection, String> {
    let approved: Vec<Value> = concepts.iter().filter(|c| s(c, "status") == Some("approved")).cloned().collect();
    let wanted: [&str; 2] = if scope == "direction" { ["world", "dual"] } else { ["composition", "dual"] };
    // Map keyed by wellTier (string or null); iteration order = insertion order.
    let mut tier_order: Vec<String> = Vec::new();
    let mut by_tier: HashMap<String, Vec<Value>> = HashMap::new();
    for c in &approved {
        let tier = match c.get("wellTier") {
            Some(Value::String(t)) => t.clone(),
            _ => "\u{0}null".to_string(),
        };
        if !by_tier.contains_key(&tier) {
            tier_order.push(tier.clone());
        }
        by_tier.entry(tier).or_default().push(c.clone());
    }
    if WELL_TIERS.iter().any(|t| by_tier.get(*t).map(|p| p.is_empty()).unwrap_or(true)) {
        return Err("concept-seed: every challenger tier needs at least one approved concept".to_string());
    }
    // A mode with quotas does not fall back: refilling an emptied tier from its
    // whole pool would deal the worlds the reviewer kept out of the mode, so the
    // tier's picks move to graphic. Graphic itself still falls back.
    let mut quotas = tier_quotas(mode);
    if let Some(mode) = mode {
        for tier in &tier_order {
            let pool = by_tier.get(tier).unwrap();
            let eligible: Vec<Value> = pool.iter().filter(|c| mode_allows(c, mode)).cloned().collect();
            if !eligible.is_empty() {
                by_tier.insert(tier.clone(), eligible);
            } else if let Some(q) = quotas.as_mut() {
                if tier != "graphic" {
                    if let Some(moved) = q.get(tier).copied() {
                        *q.entry("graphic".to_string()).or_insert(0) += moved;
                        q.insert(tier.clone(), 0);
                    }
                }
            }
        }
    }
    for tier in &tier_order {
        let pool = by_tier.get(tier).unwrap();
        let matching: Vec<Value> = pool.iter().filter(|c| s(c, "strength").map(|x| wanted.contains(&x)).unwrap_or(false)).cloned().collect();
        if !matching.is_empty() {
            by_tier.insert(tier.clone(), matching);
        }
    }

    let pick_round = |round: usize, excluded: &HashSet<String>| -> Vec<Value> {
        let salt = if round == 0 { String::new() } else { format!(":reroll-{}", round) };
        let tiers: Vec<String> = WELL_TIERS.iter().map(|t| t.to_string()).collect();
        let order = rank(&tiers, &format!("{}:{}:tiers{}", scope, key, salt), |t| t.clone());
        let mut picks: Vec<Value> = Vec::new();
        for (index, tier) in order.iter().enumerate() {
            // A zero-quota tier is skipped without shifting `index`, so every
            // tier's salt stays what it was.
            let quota = match &quotas {
                Some(q) => q.get(tier).copied().unwrap_or(0),
                None => DEFAULT_TIER_QUOTA,
            };
            if quota == 0 {
                continue;
            }
            let full = by_tier.get(tier).cloned().unwrap_or_default();
            let fresh: Vec<Value> = full.iter().filter(|c| !excluded.contains(s(c, "id").unwrap_or(""))).cloned().collect();
            let salt_input = format!("{}:{}:challenger-{}{}", scope, key, index, salt);
            // Reuse over starvation.
            let first_pool = if fresh.is_empty() { &full } else { &fresh };
            let mut tier_picks = pick_from_families(&rank_tier(first_pool, &salt_input), quota, &[]);
            // Under a quota, a tier whose unseen worlds cannot fill the quota
            // deals every unseen one first and only then tops up from worlds
            // already shown, so a late re-roll never repeats a world ahead of a
            // new one.
            if quotas.is_some() && tier_picks.len() < quota && !fresh.is_empty() && fresh.len() < full.len() {
                let rest: Vec<Value> = full
                    .iter()
                    .filter(|c| !tier_picks.iter().any(|p| s(p, "id") == s(c, "id")))
                    .cloned()
                    .collect();
                let more = pick_from_families(&rank_tier(&rest, &salt_input), quota - tier_picks.len(), &tier_picks);
                tier_picks.extend(more);
            }
            picks.extend(tier_picks);
        }
        picks
    };

    let mut excluded: HashSet<String> = HashSet::new();
    let mut picks = pick_round(0, &excluded);
    for round in 1..=reroll {
        for p in &picks {
            excluded.insert(s(p, "id").unwrap_or("").to_string());
        }
        picks = pick_round(round, &excluded);
    }
    Ok(ChallengerSelection { approved, picks })
}

#[derive(Clone)]
pub struct CompositionMatch {
    pub grain: Option<String>,
    pub at_grain: Option<usize>,
    pub grain_available: Option<usize>,
    pub platform: Option<String>,
    pub platform_excluded: usize,
}

pub struct CompositionSelection {
    pub picks: Vec<Value>,
    pub match_: CompositionMatch,
}

fn empty_match(grain: Option<&str>, platform: Option<&str>, platform_excluded: usize) -> CompositionMatch {
    CompositionMatch {
        grain: grain.map(|g| g.to_string()),
        at_grain: grain.map(|_| 0),
        grain_available: grain.map(|_| 0),
        platform: platform.map(|p| p.to_string()),
        platform_excluded,
    }
}

/// JS: selectApprovedCompositions
pub fn select_approved_compositions(
    scope: &str,
    key: &str,
    reroll: usize,
    mode: Option<&str>,
    grain: Option<&str>,
    platform: Option<&str>,
    compositions: &[Value],
    count: usize,
) -> CompositionSelection {
    let mut approved: Vec<Value> = compositions.iter().filter(|c| s(c, "status") == Some("approved")).cloned().collect();
    let broad: Vec<Value> = approved.iter().filter(|c| review_field(c, "breadth").and_then(|b| b.as_str()) != Some("niche")).cloned().collect();
    if !broad.is_empty() {
        approved = broad;
    }
    if approved.is_empty() {
        return CompositionSelection { picks: vec![], match_: empty_match(grain, platform, 0) };
    }
    if let Some(mode) = mode {
        let matching: Vec<Value> = approved.iter().filter(|c| s(c, "surface") == Some(mode)).cloned().collect();
        if matching.is_empty() {
            return CompositionSelection { picks: vec![], match_: empty_match(grain, platform, 0) };
        }
        approved = matching;
    }
    let mut platform_excluded = 0;
    if let Some(platform) = platform {
        let survives: Vec<Value> = approved
            .iter()
            .filter(|c| match c.get("platforms").and_then(|p| p.as_array()) {
                Some(a) if !a.is_empty() => a.iter().any(|p| p.as_str() == Some(platform)),
                _ => true,
            })
            .cloned()
            .collect();
        platform_excluded = approved.len() - survives.len();
        approved = survives;
        if approved.is_empty() {
            return CompositionSelection { picks: vec![], match_: empty_match(grain, Some(platform), platform_excluded) };
        }
    }
    let mut prior: HashSet<String> = HashSet::new();
    let mut picks: Vec<Value> = Vec::new();
    for round in 0..=reroll {
        let available: Vec<Value> = approved.iter().filter(|c| !prior.contains(s(c, "id").unwrap_or(""))).cloned().collect();
        let base = if available.len() >= count.min(approved.len()) { available } else { approved.clone() };
        let mut tickets = composition_tickets(&base);
        if tickets.is_empty() {
            tickets = base.iter().map(|c| Ticket { item: c.clone(), ticket: 0 }).collect();
        }
        let salt = if round == 0 { format!("{}:{}:staging", scope, key) } else { format!("{}:{}:staging:reroll-{}", scope, key, round) };
        let ranked: Vec<Value> = rank(&tickets, &salt, |e| format!("{}#{}", s(&e.item, "id").unwrap_or(""), e.ticket))
            .into_iter()
            .map(|e| e.item)
            .collect();
        let ordered: Vec<Value> = match grain {
            Some(g) => {
                let mut o: Vec<Value> = ranked.iter().filter(|c| s(c, "grain") == Some(g)).cloned().collect();
                o.extend(ranked.iter().filter(|c| s(c, "grain") != Some(g)).cloned());
                o
            }
            None => ranked,
        };
        let mut families: HashSet<String> = HashSet::new();
        picks = Vec::new();
        for c in &ordered {
            let family = match c.get("familyId") {
                Some(Value::Null) | None => s(c, "id").unwrap_or("").to_string(),
                Some(Value::String(f)) => f.clone(),
                Some(v) => serde_json::to_string(v).unwrap_or_default(),
            };
            if families.contains(&family) {
                continue;
            }
            picks.push(c.clone());
            families.insert(family);
            if picks.len() >= count {
                break;
            }
        }
        for c in &ordered {
            if picks.len() >= count {
                break;
            }
            let cid = s(c, "id").unwrap_or("");
            if !picks.iter().any(|p| s(p, "id").unwrap_or("") == cid) {
                picks.push(c.clone());
            }
        }
        if round < reroll {
            for p in &picks {
                prior.insert(s(p, "id").unwrap_or("").to_string());
            }
        }
    }
    let at_grain = grain.map(|g| picks.iter().filter(|c| s(c, "grain") == Some(g)).count());
    CompositionSelection {
        match_: CompositionMatch {
            grain: grain.map(|g| g.to_string()),
            at_grain,
            grain_available: grain.map(|g| approved.iter().filter(|c| s(c, "grain") == Some(g)).count()),
            platform: platform.map(|p| p.to_string()),
            platform_excluded,
        },
        picks,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn parity() -> Value {
        serde_json::from_str(include_str!("../../../tests/fixtures/roll-quota-parity.json")).unwrap()
    }

    fn closed_interaction(concepts: &[Value]) -> Vec<Value> {
        concepts
            .iter()
            .map(|c| {
                let mut c = c.clone();
                if s(&c, "wellTier") == Some("interaction") {
                    c["review"]["allowedModes"] = json!(["persuade"]);
                }
                c
            })
            .collect()
    }

    fn ids(picks: &[Value]) -> Vec<String> {
        picks.iter().map(|p| s(p, "id").unwrap().to_string()).collect()
    }

    fn tiers(picks: &[Value]) -> HashMap<String, usize> {
        let mut out = HashMap::new();
        for p in picks {
            *out.entry(s(p, "wellTier").unwrap().to_string()).or_insert(0) += 1;
        }
        out
    }

    // The fixture is recorded from the site's JS selection: modes without a
    // quota from the code before quotas existed, operate from the quota code.
    // Every case must match, which holds the two implementations in parity and
    // pins every other mode's rolls byte-identical.
    #[test]
    fn matches_the_js_selection_for_every_recorded_roll() {
        let fixture = parity();
        let open: Vec<Value> = fixture["concepts"].as_array().unwrap().clone();
        let closed = closed_interaction(&open);
        let cases = fixture["cases"].as_array().unwrap();
        assert!(cases.len() > 100);
        for case in cases {
            let concepts = if case["catalog"] == "closed-interaction" { &closed } else { &open };
            let mode = case["mode"].as_str();
            let sel = select_approved_challengers(
                case["scope"].as_str().unwrap(),
                case["key"].as_str().unwrap(),
                case["reroll"].as_u64().unwrap() as usize,
                mode,
                concepts,
            )
            .unwrap();
            let want: Vec<String> = case["picks"].as_array().unwrap().iter().map(|v| v.as_str().unwrap().to_string()).collect();
            assert_eq!(ids(&sel.picks), want, "case {}", case);
        }
    }

    #[test]
    fn operate_deals_five_graphic_one_interaction_and_no_atmosphere() {
        let open: Vec<Value> = parity()["concepts"].as_array().unwrap().clone();
        for key in ["alpha", "beta", "gamma"] {
            for reroll in 0..3 {
                let sel = select_approved_challengers("direction", key, reroll, Some("operate"), &open).unwrap();
                let t = tiers(&sel.picks);
                assert_eq!(t.get("graphic"), Some(&5), "{key}/{reroll}");
                assert_eq!(t.get("interaction"), Some(&1), "{key}/{reroll}");
                assert_eq!(t.get("atmosphere"), None, "{key}/{reroll}");
            }
        }
    }

    // Before quotas, a tier the mode filter would empty refilled from its whole
    // approved pool, dealing worlds the reviewer had closed to the mode.
    #[test]
    fn an_emptied_tier_hands_its_picks_to_graphic() {
        let closed = closed_interaction(parity()["concepts"].as_array().unwrap());
        let sel = select_approved_challengers("direction", "alpha", 0, Some("operate"), &closed).unwrap();
        assert_eq!(tiers(&sel.picks).get("graphic"), Some(&6));
        for p in &sel.picks {
            assert!(mode_allows(p, "operate"), "{} is closed to operate", s(p, "id").unwrap());
        }
    }

    // A late re-roll whose unseen graphic concepts cannot fill the quota deals
    // every unseen one first, then tops up with families not yet in the hand.
    #[test]
    fn a_short_tier_deals_unseen_first_and_tops_up_across_families() {
        let open: Vec<Value> = parity()["concepts"].as_array().unwrap().clone();
        let graphic: Vec<Value> = open
            .iter()
            .filter(|c| {
                s(c, "status") == Some("approved")
                    && s(c, "wellTier") == Some("graphic")
                    && mode_allows(c, "operate")
                    && matches!(s(c, "strength"), Some("world") | Some("dual"))
                    && review_field(c, "breadth").and_then(|b| b.as_str()) != Some("niche")
            })
            .cloned()
            .collect();
        let mut seen: HashSet<String> = HashSet::new();
        let mut short_rounds = 0;
        for round in 0..6 {
            let sel = select_approved_challengers("direction", "chain", round, Some("operate"), &open).unwrap();
            let dealt: Vec<Value> = sel.picks.iter().filter(|p| s(p, "wellTier") == Some("graphic")).cloned().collect();
            let unseen: Vec<&Value> = graphic.iter().filter(|c| !seen.contains(s(c, "id").unwrap())).collect();
            let dealt_ids: HashSet<String> = ids(&dealt).into_iter().collect();
            if !unseen.is_empty() && unseen.len() < 5 && dealt.len() == 5 {
                short_rounds += 1;
                for c in &unseen {
                    assert!(dealt_ids.contains(s(c, "id").unwrap()), "round {round} skipped unseen {}", s(c, "id").unwrap());
                }
                let taken: Vec<Value> = unseen.iter().map(|c| c["familyId"].clone()).collect();
                let top_up: Vec<&Value> = dealt.iter().filter(|p| !unseen.iter().any(|c| s(c, "id") == s(p, "id"))).collect();
                let families_left = graphic.iter().map(|c| c["familyId"].clone()).filter(|f| !taken.contains(f)).collect::<Vec<_>>();
                if !families_left.is_empty() {
                    assert!(!taken.contains(&top_up[0]["familyId"]), "round {round} top-up reused a taken family");
                }
            }
            if unseen.is_empty() {
                break;
            }
            seen.extend(dealt_ids);
        }
        assert!(short_rounds > 0, "the chain never reached a short round");
    }

    #[test]
    fn modes_without_a_quota_keep_two_per_tier() {
        let open: Vec<Value> = parity()["concepts"].as_array().unwrap().clone();
        for mode in [None, Some("persuade"), Some("read"), Some("experience")] {
            let sel = select_approved_challengers("direction", "alpha", 0, mode, &open).unwrap();
            let t = tiers(&sel.picks);
            for tier in WELL_TIERS {
                assert_eq!(t.get(tier), Some(&2), "{mode:?} {tier}");
            }
        }
    }
}
