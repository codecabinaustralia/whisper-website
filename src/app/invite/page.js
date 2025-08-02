'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { generateKeyPair } from '@/lib/crypto/generateKeyPair';

function InviteInner() {
  const params = useSearchParams();
  const code = params.get('code');

  const [status, setStatus] = useState('loading');
  const [inviter, setInviter] = useState(null);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signingUp, setSigningUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!code) {
      setStatus('invalid');
      return;
    }

    const fetchInvite = async () => {
      try {
        const q = query(
          collection(db, 'userProfiles'),
          where('partnerInviteCode', '==', code)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const docRef = snapshot.docs[0];
          setInviter({ ...docRef.data(), id: docRef.id });
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (e) {
        console.error(e);
        setStatus('invalid');
      }
    };

    fetchInvite();
  }, [code]);

  const handleSignup = async () => {
    setSigningUp(true);
    setError('');

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );

      const uid = userCred.user.uid;

      // Generate keypair
      const { publicKey } = await generateKeyPair(uid); // Implement this with secure storage on device or localStorage if demo

      // Update inviter's profile
      await updateDoc(doc(db, 'userProfiles', inviter.id), {
        partnerB: uid,
        publicKeyB: publicKey,
        allUsers: arrayUnion(uid),
      });

      setStatus('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setSigningUp(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-center mt-20">Checking invite link...</div>;
  }

  if (status === 'invalid') {
    return (
      <div className="text-center mt-20 text-red-600">Invalid or expired invite.</div>
    );
  }

  if (status === 'done') {
    return (
      <div className="text-center mt-20 text-green-600">
        Signup complete! You’re now connected. Open the app to continue.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">
        You're invited to join Whisper
      </h1>
      <p className="text-center text-gray-700 mb-6">
        <span className="font-semibold">{inviter?.email || 'A partner'}</span>{' '}
        wants to connect with you.
      </p>

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Your Email"
          value={signupEmail}
          onChange={(e) => setSignupEmail(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          onClick={handleSignup}
          disabled={signingUp}
          className="w-full bg-pink-600 text-white font-semibold py-2 rounded hover:bg-pink-700"
        >
          {signingUp ? 'Signing up...' : 'Create My Account'}
        </button>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <InviteInner />
    </Suspense>
  );
}


