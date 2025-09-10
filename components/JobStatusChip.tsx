
import React from 'react';
import type { JobStatus } from '../types';
import { JobStatusEnum } from '../types';

interface JobStatusChipProps {
  status: JobStatus;
}

const JobStatusChip: React.FC<JobStatusChipProps> = ({ status }) => {
  const statusStyles: { [key in JobStatus]: string } = {
    [JobStatusEnum.PENDING]: 'bg-yellow-500/20 text-yellow-300',
    [JobStatusEnum.RUNNING]: 'bg-blue-500/20 text-blue-300 animate-pulse',
    [JobStatusEnum.DONE]: 'bg-green-500/20 text-green-300',
    [JobStatusEnum.ERROR]: 'bg-red-500/20 text-red-300',
  };

  const dotStyles: { [key in JobStatus]: string } = {
    [JobStatusEnum.PENDING]: 'bg-yellow-400',
    [JobStatusEnum.RUNNING]: 'bg-blue-400',
    [JobStatusEnum.DONE]: 'bg-green-400',
    [JobStatusEnum.ERROR]: 'bg-red-400',
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      <span className={`w-2 h-2 mr-1.5 rounded-full ${dotStyles[status]}`}></span>
      {status}
    </div>
  );
};

export default JobStatusChip;
