<template>
  <UContainer class="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
    <UCard class="relative w-full max-w-5xl text-center bg-gray-800 shadow-xl p-6">

      <UButton @click="openFilePicker" size="large" type="primary">
        Upload Image
      </UButton>
      <input ref="fileInput" type="file" accept="image/*" @change="handleImageUpload" class="hidden" />

      <!-- Uploading Indicator -->
      <UAlert v-if="uploading" type="info" class="mt-4">
        Uploading...
      </UAlert>

      <!-- Error Message -->
      <UAlert v-if="error" type="error" class="mt-4">
        {{ error }}
      </UAlert>

      <!-- Image Gallery -->
      <div v-if="imageUrls.length > 0" class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <UCard v-for="(image, index) in imageUrls" :key="index" class="relative flex justify-center items-center p-2 bg-gray-700 rounded-lg shadow-md">
          <img :src="image.url" alt="Uploaded Image" class="max-w-full max-h-[200px] object-cover rounded-lg cursor-pointer"
            @click="openModal(image.url)" />
          <UButton quaternary class="absolute top-2 right-2" @click="deleteImage(image.url, index)">
            <UIcon name="ic:outline-delete" />
          </UButton>
        </UCard>
      </div>

    </UCard>

    <!-- Simple Modal for Enlarged Image -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-gray-800 p-6 rounded-lg max-w-3xl max-h-[80vh]">
        <img v-if="selectedImageUrl" :src="selectedImageUrl" alt="Enlarged Image" class="max-w-full max-h-full object-contain mx-auto" />
        <UButton block type="error" @click="closeModal" class="mt-4">
          Close
        </UButton>
      </div>
    </div>

  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storage } from "@/utils/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import Compressor from "compressorjs";

// Image data
const imageUrls = ref<{ url: string, ref: any }[]>([]);
const uploading = ref(false);
const error = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Modal state
const showModal = ref(false);
const selectedImageUrl = ref<string | null>(null);

// Maximum file size
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Fetch images on mount
const fetchImages = async () => {
  const imagesRef = storageRef(storage, "uploads");
  try {
    const result = await listAll(imagesRef);
    for (const item of result.items) {
      const url = await getDownloadURL(item);
      imageUrls.value.push({ url, ref: item });
    }
  } catch (err) {
    console.error("Error fetching images", err);
  }
};
onMounted(fetchImages);

// Open file picker
const openFilePicker = () => {
  fileInput.value?.click();
};

// Handle image upload
const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    error.value = "File size exceeds the 5MB limit.";
    return;
  }

  uploading.value = true;
  error.value = null;

  new Compressor(file, {
    quality: 0.8,
    success: async (compressedFile) => {
      const fileName = `compressed_${Date.now()}.jpg`;
      const fileRef = storageRef(storage, `uploads/${fileName}`);

      try {
        await uploadBytes(fileRef, compressedFile);
        const url = await getDownloadURL(fileRef);
        imageUrls.value.push({ url, ref: fileRef });
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        uploading.value = false;
      }
    },
    error: (err) => {
      console.error("Compression failed", err);
      uploading.value = false;
    },
  });
};

// Delete image
const deleteImage = async (url: string, index: number) => {
  const fileRef = imageUrls.value[index].ref;

  try {
    await deleteObject(fileRef);
    imageUrls.value.splice(index, 1);
  } catch (err) {
    console.error("Delete failed", err);
  }
};

// Modal functions
const openModal = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl;
  showModal.value = true; // This opens the modal
};

const closeModal = () => {
  showModal.value = false; // This closes the modal
  selectedImageUrl.value = null;
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>