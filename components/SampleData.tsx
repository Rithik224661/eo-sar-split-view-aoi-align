import React, { useState } from 'react';
import type { FileInfo, ToastMessage } from '../types';

// Previous URLs were blocked by CORS policy. These new URLs from osgeo.org are configured with
// Access-Control-Allow-Origin: * and can be fetched by the browser.
const SAMPLE_A_URL = 'https://download.osgeo.org/geotiff/samples/cog/cog.tif';
const SAMPLE_A_NAME = 'cog_sample.tif';

const SAMPLE_B_URL = 'https://download.osgeo.org/geotiff/samples/cog/overviews.tif';
const SAMPLE_B_NAME = 'overviews_sample.tif';


const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

interface SampleDataProps {
  setImageA: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  setImageB: React.Dispatch<React.SetStateAction<FileInfo | null>>;
  disabled: boolean;
  setToast: (toast: ToastMessage) => void;
}

const SampleData: React.FC<SampleDataProps> = ({ setImageA, setImageB, disabled, setToast }) => {
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const loadSample = async (
    url: string, 
    name: string, 
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setImage: React.Dispatch<React.SetStateAction<FileInfo | null>>
  ) => {
    setLoading(true);
    setToast({ type: 'info', message: `Downloading ${name}...`});
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sample image: ${response.statusText} (status: ${response.status})`);
      }
      const blob = await response.blob();
      const file = new File([blob], name, { type: 'image/tiff' });
      
      setImage({
        file,
        name: file.name,
        size: formatBytes(file.size),
      });
      setToast({ type: 'success', message: `${name} loaded successfully.`});

    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({ type: 'error', message: `Could not load sample: ${errorMessage}. This is likely a network or CORS issue.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
      <h3 className="font-semibold mb-3 text-md text-gray-300">Don't have a GeoTIFF?</h3>
      <div className="flex flex-col space-y-2">
        <button 
          onClick={() => loadSample(SAMPLE_A_URL, SAMPLE_A_NAME, setLoadingA, setImageA)} 
          disabled={disabled || loadingA || loadingB}
          className="w-full text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {loadingA ? 'Loading...' : 'Load Sample A'}
        </button>
        <button 
          onClick={() => loadSample(SAMPLE_B_URL, SAMPLE_B_NAME, setLoadingB, setImageB)} 
          disabled={disabled || loadingA || loadingB}
          className="w-full text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          {loadingB ? 'Loading...' : 'Load Sample B'}
        </button>
      </div>
    </div>
  );
};

export default SampleData;
