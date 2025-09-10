
export interface FileInfo {
  file: File;
  name: string;
  size: string;
}

export interface AOI {
  north: number;
  south: number;
  east: number;
  west: number;
}

export enum JobStatusEnum {
  PENDING = 'Pending',
  RUNNING = 'Running',
  DONE = 'Done',
  ERROR = 'Error',
}

export type JobStatus = JobStatusEnum;


export interface Job {
  jobId: string;
  status: JobStatus;
  outputs: {
    imageAUrl: string;
    imageBUrl: string;
  } | null;
  error: string | null;
}

export interface CreateJobPayload {
  imageAId: string;
  imageBId: string;
  aoi: AOI;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  type: ToastType;
  message: string;
}
