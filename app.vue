<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-6">
    <div class="relative bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-5xl text-center">
      <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
        Upload Image
        <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
      </label>

      <!-- Display loading message while uploading -->
      <div v-if="uploading" class="mt-4 text-white">Uploading...</div>

      <!-- Display error message if file is too large -->
      <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>

      <!-- Gallery Section -->
      <div v-if="imageUrls.length > 0" class="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="(image, index) in imageUrls" :key="index" class="flex justify-center relative">
          <img
            :src="image.url"
            alt="Uploaded Image"
            class="max-w-full max-h-[200px] object-cover rounded-lg shadow-lg cursor-pointer"
            @click="openModal(image.url)"
          />
          
          <!-- Delete Button -->
          <button
            @click="deleteImage(image.url, index)"
            class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full shadow hover:bg-red-700 transition"
          >
            X
          </button>
        </div>
      </div>
    </div>

<!-- Modal for Enlarged Image -->
<div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
  <div class="relative">
    <!-- Ensure that the selectedImageUrl is a string before rendering the image -->
    <img
      v-if="selectedImageUrl"
      :src="selectedImageUrl"
      alt="Enlarged Image"
      class="max-w-3xl max-h-[80vh] object-contain rounded-lg shadow-lg"
    />
    <!-- Close Button -->
    <button @click="closeModal" class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded-full shadow-lg">
      Close
    </button>
  </div>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { storage } from "@/utils/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";

// Array to store multiple image URLs with Firebase reference
const imageUrls = ref<{ url: string, ref: any }[]>([]);
const uploading = ref(false);
const error = ref<string | null>(null);

// Modal state
const showModal = ref(false);
const selectedImageUrl = ref<string | null>(null);

// Maximum file size limit (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Fetch all images from Firebase Storage on component mount
const fetchImages = async () => {
  const imagesRef = storageRef(storage, "uploads"); // Path where images are stored in Firebase
  try {
    const result = await listAll(imagesRef); // Get all files in the 'uploads' folder

    // For each file, get the download URL and store it in the imageUrls array
    for (const item of result.items) {
      const url = await getDownloadURL(item);
      imageUrls.value.push({ url, ref: item }); // Add URL and reference to the gallery
    }
  } catch (error) {
    console.error("Error fetching images", error);
  }
};

// Call fetchImages when the component is mounted
onMounted(fetchImages);

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Check if file size exceeds the limit
  if (file.size > MAX_FILE_SIZE) {
    error.value = "File size exceeds the 5 MB limit. Please upload a smaller image.";
    return; // Prevent upload if file is too large
  }

  error.value = null; // Clear any previous error
  uploading.value = true;

  // Create storage reference
  const fileRef = storageRef(storage, `uploads/${file.name}`);

  try {
    // Upload file
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Add the uploaded image URL and reference to the gallery
    imageUrls.value.push({ url, ref: fileRef });
  } catch (error) {
    console.error("Upload failed", error);
  } finally {
    uploading.value = false;
  }
};

// Function to delete image from Firebase Storage and the gallery
const deleteImage = async (url: string, index: number) => {
  const fileRef = imageUrls.value[index].ref; // Get the Firebase Storage reference for the image

  try {
    // Delete the file from Firebase Storage
    await deleteObject(fileRef);

    // Remove the image from the gallery
    imageUrls.value.splice(index, 1);
  } catch (error) {
    console.error("Delete failed", error);
  }
};

// Function to open the modal with the enlarged image
const openModal = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl;
  showModal.value = true;
};

// Function to close the modal
const closeModal = () => {
  showModal.value = false;
  selectedImageUrl.value = null;
};
</script>

<style scoped>
/* Image transitions */
img {
  transition: all 0.3s ease-in-out;
}

/* Modal styling */
.fixed {
  position: fixed;
}

.bg-black {
  background-color: rgba(0, 0, 0, 0.5);
}

.object-contain {
  object-fit: contain;
}

.object-cover {
  object-fit: cover;
}

button {
  cursor: pointer;
}

@media (min-width: 640px) {
  .gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
