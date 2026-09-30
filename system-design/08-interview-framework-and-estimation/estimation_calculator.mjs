// Module 08: Back-of-the-Envelope System Design Estimation Calculator

export class SystemDesignEstimator {
  static SECONDS_PER_DAY = 86400;

  /**
   * Calculates Average and Peak QPS based on DAU and requests per user
   */
  static calculateQps({ dau, requestsPerUser, spikeMultiplier = 2 }) {
    const totalDailyRequests = dau * requestsPerUser;
    const averageQps = Math.round(totalDailyRequests / this.SECONDS_PER_DAY);
    const peakQps = Math.round(averageQps * spikeMultiplier);
    return {
      totalDailyRequests,
      averageQps,
      peakQps
    };
  }

  /**
   * Estimates storage requirements over a given period in years
   */
  static estimateStorage({
    dailyWrites,
    avgPayloadBytes,
    years = 5,
    replicationFactor = 3,
    headroom = 1.3
  }) {
    const dailyRawBytes = dailyWrites * avgPayloadBytes;
    const yearlyRawBytes = dailyRawBytes * 365;
    const totalRawBytes = yearlyRawBytes * years;
    const totalStorageBytes = totalRawBytes * replicationFactor * headroom;

    return {
      dailyRawBytes,
      totalRawBytes,
      totalStorageBytes,
      humanDaily: this.formatBytes(dailyRawBytes),
      humanTotalRaw: this.formatBytes(totalRawBytes),
      humanStorageNeeded: this.formatBytes(totalStorageBytes)
    };
  }

  /**
   * Calculates network throughput (MB/s) and bandwidth (Gbps)
   */
  static estimateBandwidth({ qps, avgPayloadBytes }) {
    const bytesPerSecond = qps * avgPayloadBytes;
    const throughputMBps = bytesPerSecond / (1024 * 1024);
    const bandwidthGbps = (throughputMBps * 8) / 1000;

    return {
      bytesPerSecond,
      throughputMBps: parseFloat(throughputMBps.toFixed(2)),
      bandwidthGbps: parseFloat(bandwidthGbps.toFixed(2))
    };
  }

  /**
   * Estimates required cache RAM using the 80/20 Pareto principle
   */
  static estimateCacheRam({ dailyReadBytes, hotRatio = 0.2 }) {
    const cacheBytes = dailyReadBytes * hotRatio;
    return {
      cacheBytes,
      humanCacheRam: this.formatBytes(cacheBytes)
    };
  }

  /**
   * Converts bytes to human readable format (KB, MB, GB, TB, PB)
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
