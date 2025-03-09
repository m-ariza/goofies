<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 p-6">
    <div class="relative bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-5xl text-center">
      <label class="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
        Upload Image
        <input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
      </label>

      <div v-if="imageUrl" class="mt-4 flex justify-center">
        <img :src="imageUrl" alt="Uploaded Image" class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const imageUrl = ref<string | null>(null);

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    imageUrl.value = URL.createObjectURL(file);
  }
};
</script>

<style scoped>
/* Ensure container adjusts properly */
img {
  transition: all 0.3s ease-in-out;
}
</style>
