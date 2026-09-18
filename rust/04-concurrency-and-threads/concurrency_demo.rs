// rust/04-concurrency-and-threads/concurrency_demo.rs
//! Demonstrates Fearless Concurrency: Threads, MPSC Channels, Arc, Mutex, and Scoped Threads.

use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct JobMetrics {
    pub completed_tasks: usize,
    pub total_bytes_processed: usize,
}

pub struct Task {
    pub id: u64,
    pub payload: Vec<u8>,
}

fn main() {
    println!("=== RUST FEARLESS CONCURRENCY DEMO ===");

    // 1. Shared State with Arc<Mutex<T>>
    let metrics = Arc::new(Mutex::new(JobMetrics {
        completed_tasks: 0,
        total_bytes_processed: 0,
    }));

    // 2. MPSC Channel with Bounded Capacity (Backpressure)
    let (tx, rx) = mpsc::sync_channel::<Task>(10);

    // Spawn 4 Worker Threads
    let mut workers = vec![];
    let rx_shared = Arc::new(Mutex::new(rx));

    for worker_id in 0..4 {
        let rx_clone = Arc::clone(&rx_shared);
        let metrics_clone = Arc::clone(&metrics);

        let handle = thread::spawn(move || {
            loop {
                // Receive next task; lock rx only while taking task:
                let task = {
                    let rx_guard = rx_clone.lock().unwrap();
                    match rx_guard.recv() {
                        Ok(t) => t,
                        Err(_) => break, // All senders disconnected -> clean exit
                    }
                };

                println!("Worker {} processing Task {}", worker_id, task.id);
                thread::sleep(Duration::from_millis(10));

                // Atomically update metrics:
                {
                    let mut m = metrics_clone.lock().unwrap();
                    m.completed_tasks += 1;
                    m.total_bytes_processed += task.payload.len();
                } // RAII MutexGuard drops here, releasing lock
            }
        });
        workers.push(handle);
    }

    // Producer dispatching tasks
    for i in 1..=10 {
        tx.send(Task {
            id: i,
            payload: vec![0xAA; (i * 100) as usize],
        }).unwrap();
    }

    // Drop producer sender to signal EOF:
    drop(tx);

    // Join all workers
    for worker in workers {
        worker.join().unwrap();
    }

    // Inspect final metrics
    let final_metrics = metrics.lock().unwrap();
    println!("Tasks Completed: {}", final_metrics.completed_tasks);
    println!("Total Bytes: {}", final_metrics.total_bytes_processed);

    // 3. Scoped Threads (Parallel computation borrowing stack memory)
    let mut stack_array = [10, 20, 30, 40];
    thread::scope(|s| {
        let (left, right) = stack_array.split_at_mut(2);
        s.spawn(|| {
            left[0] += 1;
            left[1] += 1;
        });
        s.spawn(|| {
            right[0] *= 2;
            right[1] *= 2;
        });
    });
    println!("Scoped thread results: {:?}", stack_array);
}
