'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function InvitePage() {
  const params = useSearchParams();
  const code = params.get('code');
  const [status, setStatus] = useState('loading');
  const [inviter, setInviter] = useState(null);

  useEffect(() => {
    if (!code) {
      setStatus('invalid');
      return;
    }

    const fetchInvite = async () => {
      try {
        const snap = await getDoc(doc(db, 'userProfiles', code));
        if (snap.exists()) {
          setInviter(snap.data());
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (error) {
        console.error('Error fetching invite:', error);
        setStatus('invalid');
      }
    };

    fetchInvite();
  }, [code]);

  if (status === 'loading') {
    return <div className="text-center mt-20">Checking invite link...</div>;
  }

  if (status === 'invalid') {
    return (
      <div className="text-center mt-20 text-red-600">
        Invalid or expired invite link.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">You're invited to join Whisper</h1>
      <p className="text-center text-gray-700 mb-6">
        <span className="font-semibold">{inviter?.email || 'A partner'}</span> wants to connect with you.
      </p>
      <a
        href="https://apps.apple.com/app/whisper-ai-couples-chat/id000000"
        className="block w-full text-center bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded"
      >
        Download the Whisper App
      </a>
    </div>
  );
}
