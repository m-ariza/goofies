<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-6">
    <div class="relative bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-5xl text-center">
      <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
        Upload Image
        <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
      </label>

      <!-- Display loading message while uploading -->
      <div v-if="uploading" class="mt-4 text-white">Uploading...</div>

      <!-- Gallery Section -->
      <div v-if="imageUrls.length > 0" class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="(image, index) in imageUrls" :key="index" class="flex justify-center">
          <img :src="image" alt="Uploaded Image" class="max-w-full max-h-[200px] object-cover rounded-lg shadow-lg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { storage } from "@/utils/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Array to store multiple image URLs
const imageUrls = ref<string[]>([]);
const uploading = ref(false);

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;

  // Create storage reference
  const fileRef = storageRef(storage, `uploads/${file.name}`);

  try {
    // Upload file
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Add the uploaded image URL to the gallery
    imageUrls.value.push(url);
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
/* Image transitions */
img {
  transition: all 0.3s ease-in-out;
}

/* Gallery styling for responsiveness */
@media (min-width: 640px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
