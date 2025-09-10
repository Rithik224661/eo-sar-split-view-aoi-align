
import type { CreateJobPayload, Job } from '../types';
import { JobStatusEnum } from '../types';

const jobs: { [key: string]: Job & { _progress: number; imageAId: string; imageBId: string; } } = {};
const uploadedFiles = new Map<string, File>();

// Simulate file upload, returning a unique ID
export const uploadImage = (file: File): Promise<string> => {
  console.log(`Simulating upload for ${file.name}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      uploadedFiles.set(imageId, file);
      resolve(imageId);
    }, 500 + Math.random() * 500);
  });
};

// Simulate job creation
export const createJob = (payload: CreateJobPayload): Promise<{ jobId: string }> => {
  console.log('Simulating job creation with payload:', payload);
  return new Promise(resolve => {
    setTimeout(() => {
      const jobId = `job_${Date.now()}`;
      jobs[jobId] = {
        jobId,
        status: JobStatusEnum.PENDING,
        outputs: null,
        error: null,
        _progress: 0,
        imageAId: payload.imageAId,
        imageBId: payload.imageBId,
      };
      // Start the job simulation process
      simulateJobProgress(jobId);
      resolve({ jobId });
    }, 1000);
  });
};

// Simulate getting job status
export const getJobStatus = (jobId: string): Promise<Partial<Job>> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const job = jobs[jobId];
      if (job) {
        resolve({
          status: job.status,
          outputs: job.outputs,
          error: job.error,
        });
      } else {
        reject(new Error('Job not found'));
      }
    }, 300);
  });
};

// Internal function to simulate job progress
const simulateJobProgress = (jobId: string) => {
  const job = jobs[jobId];
  if (!job) return;

  // Pending -> Running
  setTimeout(() => {
    job.status = JobStatusEnum.RUNNING;
  }, 2000);
  
  // Running -> Done/Error
  setTimeout(() => {
    const isSuccess = Math.random() > 0.1; // 90% success rate
    if (isSuccess) {
      job.status = JobStatusEnum.DONE;
      // In a real app, these URLs would point to the processed GeoTIFFs.
      // Here, we create object URLs from the original uploaded files to simulate this.
      const fileA = uploadedFiles.get(job.imageAId);
      const fileB = uploadedFiles.get(job.imageBId);
      
      job.outputs = {
        imageAUrl: fileA ? URL.createObjectURL(fileA) : '',
        imageBUrl: fileB ? URL.createObjectURL(fileB) : '',
      };
    } else {
      job.status = JobStatusEnum.ERROR;
      job.error = 'Raster alignment failed due to insufficient feature points.';
    }
  }, 8000 + Math.random() * 4000); // Simulate 8-12 seconds of processing
};
