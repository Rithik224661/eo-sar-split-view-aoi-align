
import React, { useState, useCallback } from 'react';
import type { FileInfo, AOI, Job, ToastMessage } from './types';
import { JobStatusEnum } from './types';
import UploadPanel from './components/UploadPanel';
import SampleData from './components/SampleData';
import MapContainer from './components/MapContainer';
import JobStatusChip from './components/JobStatusChip';
import Toast from './components/Toast';
import { uploadImage, createJob, getJobStatus } from './services/mockApiService';

export default function App() {
  const [imageA, setImageA] = useState<FileInfo | null>(null);
  const [imageB, setImageB] = useState<FileInfo | null>(null);
  const [aoi, setAoi] = useState<AOI | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [showProcessed, setShowProcessed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [resetAoiTrigger, setResetAoiTrigger] = useState(0);

  const pollJobStatus = useCallback(async (jobId: string) => {
    const jobStatusInterval = setInterval(async () => {
      try {
        const statusData = await getJobStatus(jobId);
        setJob(prevJob => ({ ...prevJob, ...statusData } as Job));

        if (statusData.status === JobStatusEnum.DONE || statusData.status === JobStatusEnum.ERROR) {
          clearInterval(jobStatusInterval);
          setIsLoading(false);
          if (statusData.status === JobStatusEnum.DONE) {
            setToast({ type: 'success', message: 'Processing complete!' });
            setShowProcessed(true);
          } else {
            setToast({ type: 'error', message: statusData.error || 'Job failed.' });
          }
        }
      } catch (error) {
        clearInterval(jobStatusInterval);
        setIsLoading(false);
        setJob(prevJob => ({ ...prevJob, status: JobStatusEnum.ERROR, error: 'Failed to get job status' } as Job));
        setToast({ type: 'error', message: 'Failed to poll job status.' });
      }
    }, 2000);
  }, []);

  const handleProcess = async () => {
    if (!imageA || !imageB) {
      setToast({ type: 'error', message: 'Please upload both images.' });
      return;
    }
    if (!aoi) {
      setToast({ type: 'error', message: 'Please draw an Area of Interest (AOI).' });
      return;
    }

    setIsLoading(true);
    setJob(null);
    setShowProcessed(false);
    setToast({ type: 'info', message: 'Starting job... Uploading files.' });

    try {
      const [imageAId, imageBId] = await Promise.all([
        uploadImage(imageA.file),
        uploadImage(imageB.file)
      ]);

      setToast({ type: 'info', message: 'Files uploaded. Creating processing job.' });

      const { jobId } = await createJob({ imageAId, imageBId, aoi });
      setJob({ jobId, status: JobStatusEnum.PENDING, outputs: null, error: null });
      setToast({ type: 'info', message: `Job ${jobId} created. Processing...` });
      pollJobStatus(jobId);

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setToast({ type: 'error', message: `Failed to start job: ${errorMessage}` });
    }
  };
  
  const handleAoiReset = useCallback(() => {
    setAoi(null);
  }, []);

  const handleAoiResetClick = () => {
    setAoi(null);
    setResetAoiTrigger(c => c + 1); // Trigger map to clear drawing
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <aside className="w-96 h-full bg-gray-800 p-6 flex flex-col shadow-lg z-20 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">GeoTIFF Processor</h1>
          <p className="text-sm text-gray-400">Upload, clip, and align satellite imagery.</p>
        </header>
        
        <UploadPanel 
          imageA={imageA} 
          setImageA={setImageA}
          imageB={imageB}
          setImageB={setImageB}
          disabled={isLoading}
        />

        <SampleData
          setImageA={setImageA}
          setImageB={setImageB}
          disabled={isLoading}
          setToast={setToast}
        />
        
        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Area of Interest (AOI)</h3>
            {aoi && (
              <button onClick={handleAoiResetClick} className="text-xs bg-gray-600 hover:bg-red-500/50 text-red-300 font-semibold py-1 px-2 rounded-md transition-colors">
                Reset
              </button>
            )}
          </div>
          {aoi ? (
            <div className="text-sm space-y-1 text-gray-300">
              <p>N: <span className="font-mono">{aoi.north.toFixed(4)}</span>, S: <span className="font-mono">{aoi.south.toFixed(4)}</span></p>
              <p>E: <span className="font-mono">{aoi.east.toFixed(4)}</span>, W: <span className="font-mono">{aoi.west.toFixed(4)}</span></p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Draw a rectangle on the map to define the AOI.</p>
          )}
        </div>
        
        <div className="mt-auto pt-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Processing</span>
            {job && <JobStatusChip status={job.status} />}
          </div>
          
          {job?.status === JobStatusEnum.DONE && (
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <label htmlFor="show-processed" className="text-sm font-medium text-gray-200">Show Processed Output</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="show-processed" 
                    id="show-processed"
                    checked={showProcessed}
                    onChange={(e) => setShowProcessed(e.target.checked)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label htmlFor="show-processed" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"></label>
              </div>
               <style>{`.toggle-checkbox:checked { right: 0; border-color: #2dd4bf; } .toggle-checkbox:checked + .toggle-label { background-color: #2dd4bf; }`}</style>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={isLoading || !imageA || !imageB || !aoi}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            {isLoading ? 'Processing...' : 'Process AOI'}
          </button>
        </div>
      </aside>
      
      <main className="flex-1 h-full z-10">
        <MapContainer 
          imageAFile={imageA?.file}
          imageBFile={imageB?.file}
          processedOutputs={job?.outputs}
          showProcessed={showProcessed}
          onAoiDrawn={setAoi}
          onAoiReset={handleAoiReset}
          resetAoiTrigger={resetAoiTrigger}
          key={`${imageA?.file?.name}-${imageB?.file?.name}-${job?.jobId}-${showProcessed}`}
        />
      </main>
    </div>
  );
}
