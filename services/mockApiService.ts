
import type { AOI, CreateJobPayload, Job } from '../types';
import { JobStatusEnum } from '../types';

const jobs: { [key: string]: Job & { _progress: number } } = {};

// Simulate file upload, returning a unique ID
export const uploadImage = (file: File): Promise<string> => {
  console.log(`Simulating upload for ${file.name}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
      };
      // Start the job simulation process
      simulateJobProgress(jobId, payload);
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
const simulateJobProgress = (jobId: string, payload: CreateJobPayload) => {
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
      // Here, we mock them. For demonstration, we'll return object URLs
      // from the original files if they exist, to allow re-rendering.
      // This part is tricky without access to the original file objects here.
      // For simplicity, we'll return placeholder URLs.
      job.outputs = {
        imageAUrl: 'processed_A.tif', // Placeholder
        imageBUrl: 'processed_B.tif', // Placeholder
      };
    } else {
      job.status = JobStatusEnum.ERROR;
      job.error = 'Raster alignment failed due to insufficient feature points.';
    }
  }, 8000 + Math.random() * 4000); // Simulate 8-12 seconds of processing
};
