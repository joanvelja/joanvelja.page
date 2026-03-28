import TranscriptViewer from './components/TranscriptViewer';

export const metadata = {
  title: 'Debate Transcripts — Training Dynamics',
  description: 'Interactive exploration of debate protocol exploitation under RL training pressure',
  robots: { index: false, follow: false },
};

export default function TranscriptsPage() {
  return <TranscriptViewer />;
}
