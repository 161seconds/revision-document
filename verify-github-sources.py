"""Verify pinned source snapshots with Python's standard library and Git."""

import hashlib
import json
import os
import re
import subprocess
from pathlib import Path


root = Path(__file__).resolve().parent
if os.name == "nt" and not str(root).startswith("\\\\?\\"):
    root = Path("\\\\?\\" + str(root))
manifest = json.loads((root / "github-sources.json").read_text(encoding="utf-8"))
index_output = subprocess.check_output(
    ["git", "-c", "core.longpaths=true", "ls-files", "--stage", "-z", "--", *[item["path"] + "/" for item in manifest["imports"]]],
    cwd=root,
)
index = {}
for line in index_output.split(b"\0"):
    if line:
        metadata, path = line.decode("utf-8").split("\t", 1)
        mode, sha, stage = metadata.split()
        if stage != "0":
            raise ValueError("Unmerged source: " + path)
        index[path] = (mode, sha)

repositories, paths, files, total_bytes = set(), set(), 0, 0
for source in manifest["imports"]:
    repository = source["repository"]
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository) or repository in repositories:
        raise ValueError("Invalid or duplicate repository: " + repository)
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", source["path"]) or source["path"].casefold() in paths or not re.fullmatch(r"[0-9a-f]{40}", source["commit"]):
        raise ValueError("Invalid source provenance: " + repository)
    directory = root / source["path"]
    if not directory.is_dir() or directory.is_symlink() or directory.resolve().parent != root:
        raise ValueError("Source escaped archive: " + repository)
    expected = {item["path"]: item for item in source["entries"]}
    actual = {path.relative_to(directory).as_posix() for path in directory.rglob("*") if path.is_file() or path.is_symlink()}
    if len(expected) != len(source["entries"]) or actual != expected.keys():
        raise ValueError("Source file set differs: " + repository)
    source_bytes, checked_parents = 0, set()
    for relative, item in expected.items():
        if not relative or any(part in {"", ".", ".."} for part in relative.split("/")) or "\\" in relative:
            raise ValueError("Unsafe manifest path: " + relative)
        path = directory / relative
        if path.parent not in checked_parents:
            if not path.parent.resolve().is_relative_to(directory):
                raise ValueError("Source parent escaped archive: " + relative)
            checked_parents.add(path.parent)
        if item["mode"] not in {"100644", "100755", "120000"}:
            raise ValueError("Unsafe source entry: " + relative)
        if path.is_symlink():
            if item["mode"] != "120000":
                raise ValueError("Unexpected symlink: " + str(path))
            data = os.readlink(path).encode("utf-8")
        else:
            data = path.read_bytes()
        sha = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
        if len(data) != item["size"] or sha != item["sha"]:
            raise ValueError("Source blob differs: " + source["path"] + "/" + relative)
        if index.get(source["path"] + "/" + relative) != (item["mode"], item["sha"]):
            raise ValueError("Git index differs: " + source["path"] + "/" + relative)
        source_bytes += len(data)
    if len(expected) != source["files"] or source_bytes != source["bytes"]:
        raise ValueError("Source totals differ: " + repository)
    repositories.add(repository)
    paths.add(source["path"].casefold())
    files += len(expected)
    total_bytes += source_bytes
    print("PASS " + repository + ": " + str(len(expected)) + " files", flush=True)

if len(repositories) + len(manifest["existing"]) != manifest["starred_count"]:
    raise ValueError("Starred list coverage differs")
print(f"PASS: {len(repositories)} repositories, {files:,} files, {total_bytes:,} bytes; all Git blobs and modes match.")
