import { Redirect } from 'expo-router';

// Emergency flow starts from the home screen, not directly.
// Redirect to home if someone navigates here directly.
export default function EmergencyIndex() {
  return <Redirect href="/(user)" />;
}
