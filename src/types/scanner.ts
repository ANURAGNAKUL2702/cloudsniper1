export interface ScanResult {
  status: string;
  message?: string;
  accountId?: string;
  timestamp?: string;
  summary?: {
    totalInstancesScanned: number;
    stoppedInstancesCount: number;
    idleRunningInstancesCount: number;
    activeInstancesCount: number;
    unattachedEBSVolumes: number;
    s3BucketsCount: number;
    elbCount: number;
    iamUsersCount: number;
  };
  details?: {
    stoppedInstances: any[];
    idleRunningInstances: any[];
    activeInstances: any[];
    unusedEBSVolumes: any[];
    s3Buckets: any[];
    elbs: any[];
    iamUsers: any[];
  };
  // Legacy support for nested result structure
  result?: {
    status: string;
    message: string;
    accountId: string;
    timestamp: string;
    summary: {
      totalInstancesScanned: number;
      stoppedInstancesCount: number;
      idleRunningInstancesCount: number;
      activeInstancesCount: number;
      unattachedEBSVolumes: number;
      s3BucketsCount: number;
      elbCount: number;
      iamUsersCount: number;
    };
    details: {
      stoppedInstances: any[];
      idleRunningInstances: any[];
      activeInstances: any[];
      unusedEBSVolumes: any[];
      s3Buckets: any[];
      elbs: any[];
      iamUsers: any[];
    };
  };
}

export interface ServiceCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  status: 'healthy' | 'warning' | 'critical' | 'info';
  description: string;
  details?: any[];
}