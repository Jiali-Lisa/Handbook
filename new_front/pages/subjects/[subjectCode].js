import Subject_Page from '../../src/app/components/Subject_Page'; // Adjust path as needed
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Subject() {
  const router = useRouter();
  const {subjectCode} = router.query;
  const [subjectinfo, setSubjectinfo] = useState(null);

  useEffect(() => {
    if(!router.isReady) return;
    console.log(subjectCode)
  },[router.query.subjectCode, router.isReady])

  return (
      <Subject_Page subjectCode={subjectCode} /> 
  );
}
