import * as ImagePicker from 'expo-image-picker';

// Opens the gallery (or camera) and returns the chosen image uri, or null if the user cancelled.
// Throws 'permission-denied' when the user refuses access.
export async function pickImage(fromCamera: boolean, aspect: [number, number] = [4, 3]): Promise<string | null> {
    const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error('permission-denied');

    const options = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, allowsEditing: true, aspect };
    const result = fromCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    return result.canceled ? null : result.assets[0].uri;
}