'use client';

import { ProgramBuilderV2 } from '@/components/program-builder-advanced';

export default function NewProgramPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Create New Program</h1>
        <p className="text-gray-600 mt-2">Design a custom workout program for your clients</p>
      </div>
      <ProgramBuilderV2 />
    </div>
  );
}
