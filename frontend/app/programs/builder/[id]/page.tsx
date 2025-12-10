'use client';

import { use } from 'react';
import { ProgramBuilderV2 } from '@/components/program-builder-advanced';

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Edit Program</h1>
        <p className="text-gray-600 mt-2">Modify your workout program</p>
      </div>
      <ProgramBuilderV2 initialProgramId={id} />
    </div>
  );
}
