
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const ChartBox = ({ label, className, level }: { label: string; className?: string, level: number }) => (
  <div className={cn(
      "bg-primary text-primary-foreground rounded-lg p-3 text-center font-bold shadow-md mx-auto w-60",
      "flex items-center justify-center",
      level === 1 && "w-48 h-16",
      level === 2 && "w-64 h-16",
      level === 3 && "w-64 h-16",
      level === 4 && "w-56 h-14 text-sm",
      level === 5 && "w-52 h-12 text-xs",
      className
    )}>
    {label}
  </div>
);

const Connector = ({ vertical = false, className = '' }: { vertical?: boolean; className?: string }) => (
  <div className={cn(
      "bg-primary",
      vertical ? "w-1 h-8 mx-auto" : "h-1 w-full",
      className
  )}></div>
);

const ArrowDown = ({ className = '' }: { className?: string }) => (
  <div className={cn("w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary mx-auto", className)}></div>
);


export function OrganizationalChart() {
  return (
    <div className="p-4 md:p-8 bg-background rounded-lg overflow-x-auto">
        <div className="flex flex-col items-center space-y-4 min-w-[1200px]">
            {/* Level 1: Director */}
            <ChartBox label="SASTA" level={1} />
            <Connector vertical />
            <ArrowDown />
            <ChartBox label="DIRECTOR" level={2} />
            <Connector vertical />
            <div className="w-1/2 h-1 bg-primary mx-auto"></div>

            {/* Connectors to Level 2 */}
            <div className="flex justify-center w-full relative">
                <div className="absolute top-0 left-0 h-full w-1/2 border-r border-primary"></div>
                <div className="absolute top-0 right-0 h-full w-1/2"></div>
                <div className="absolute top-0 left-1/4 w-px h-8 bg-primary"></div>
                <div className="absolute top-0 right-1/4 w-px h-8 bg-primary"></div>
                 <ArrowDown className="absolute -top-px left-1/4 -ml-2" />
                 <ArrowDown className="absolute -top-px right-1/4 -ml-2" />
            </div>

             {/* Level 2: Joint Directors */}
            <div className="flex justify-around w-full pt-8">
                <ChartBox label="JOINT DIRECTOR (NR)" level={3}/>
                <ChartBox label="JOINT DIRECTOR (SR)" level={3} />
            </div>
            
             {/* Connectors to Assistant Director */}
            <div className="flex justify-center w-full relative h-8">
                 <div className="absolute top-0 left-1/4 w-px h-full bg-primary"></div>
                 <div className="absolute top-0 right-1/4 w-px h-full bg-primary"></div>
                 <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-primary"></div>
            </div>
             <Connector vertical />
             <ArrowDown />

             {/* Assistant Director */}
             <ChartBox label="ASSISTANT DIRECTOR" level={2} />
             <Connector vertical />

             {/* Connectors to Level 3 */}
            <div className="w-full h-1 bg-primary"></div>
             <div className="flex justify-between w-full relative">
                 <div className="absolute top-0 left-[12.5%] w-px h-8 bg-primary"><ArrowDown className="relative -left-2 top-8" /></div>
                 <div className="absolute top-0 left-[37.5%] w-px h-8 bg-primary"><ArrowDown className="relative -left-2 top-8" /></div>
                 <div className="absolute top-0 right-[37.5%] w-px h-8 bg-primary"><ArrowDown className="relative -left-2 top-8" /></div>
                 <div className="absolute top-0 right-[12.5%] w-px h-8 bg-primary"><ArrowDown className="relative -left-2 top-8" /></div>
            </div>

            {/* Level 3: Officers */}
             <div className="flex justify-between w-full pt-8">
                <div className="w-1/4 flex flex-col items-center space-y-4">
                    <ChartBox label="SUPERINTENDENT (ADMIN)" level={4} />
                    <Connector vertical />
                     <ArrowDown />
                    <ChartBox label="SUPPORTING STAFF" level={5} />
                </div>
                <div className="w-1/4 flex flex-col items-center space-y-4">
                    <ChartBox label="ACCOUNTS OFFICER" level={4} />
                     <Connector vertical />
                     <ArrowDown />
                    <ChartBox label="ASSISTANT ACCOUNTS OFFICER" level={5} />
                     <Connector vertical />
                     <ArrowDown />
                    <ChartBox label="SUPPORTING STAFF" level={5} />
                </div>
                <div className="w-1/4 flex flex-col items-center space-y-4">
                    <ChartBox label="SOCIAL AUDIT SPECIALIST" level={4} />
                    <div className="w-full h-1 bg-primary"></div>
                    <div className="flex w-full justify-around relative">
                        <div className="absolute top-0 left-1/4 w-px h-4 bg-primary"><ArrowDown className="relative -left-2 top-4" /></div>
                        <div className="absolute top-0 right-1/4 w-px h-4 bg-primary"><ArrowDown className="relative -left-2 top-4" /></div>
                    </div>
                     <div className="flex justify-around w-full pt-4">
                        <div className="w-1/2 flex flex-col items-center space-y-4">
                             <ChartBox label="STATE LEVEL MONITOR" level={5} />
                             <Connector vertical />
                             <ArrowDown />
                            <ChartBox label="DISTRICT RESOURCE PERSON" level={5} />
                             <Connector vertical />
                             <ArrowDown />
                            <ChartBox label="BLOCK RESOURCE PERSON" level={5} />
                             <Connector vertical />
                             <ArrowDown />
                            <ChartBox label="VILLAGE PANCHAYAT RESOURCE PERSON" level={5} />
                        </div>
                        <div className="w-1/2 flex flex-col items-center space-y-4">
                             <ChartBox label="MIS SPECIALIST" level={5} />
                             <Connector vertical />
                             <ArrowDown />
                            <ChartBox label="MIS ASSISTANT" level={5} />
                        </div>
                     </div>
                </div>
                 <div className="w-1/4 flex flex-col items-center space-y-4">
                    <ChartBox label="SUPERINTENDENT (AUDIT)" level={4} />
                    <Connector vertical />
                     <ArrowDown />
                    <ChartBox label="SUPPORTING STAFF" level={5} />
                </div>
            </div>
        </div>
    </div>
  );
}
