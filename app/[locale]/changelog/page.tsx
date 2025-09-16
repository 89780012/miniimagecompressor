import React from 'react';
import { ChangelogTimeline } from '@/components/Changelog/ChangelogTimeline';
import { changelogData } from '@/lib/changelog-data';


export default function ChangelogPage() {

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <ChangelogTimeline data={changelogData} />
      </div>
    </>
  );
}