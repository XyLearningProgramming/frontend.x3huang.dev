<template>
  <BackgroundLayout container-width="normal">
    <PageHeader 
      title="Get In Touch" 
      description="Feel free to reach out for collaborations, questions, or just to say hello!" 
    />

    <!-- Contact cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <!-- Email -->
      <a href="mailto:hello@x3huang.dev" class="block group">
        <GlassCard 
          variant="primary" 
          padding="lg" 
          radius="lg" 
          hover
          clickable
          class="text-center h-full"
        >
          <div class="text-glass">
            <div class="text-4xl mb-4">📧</div>
            <h3 class="text-xl font-semibold mb-2">
              Email
            </h3>
            <p class="text-glass-muted">
              hello@x3huang.dev
            </p>
          </div>
        </GlassCard>
      </a>

      <!-- GitHub -->
      <a href="https://github.com/x3huang" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard 
          variant="primary" 
          padding="lg" 
          radius="lg" 
          hover
          clickable
          class="text-center h-full"
        >
          <div class="text-glass">
            <div class="text-4xl mb-4">💻</div>
            <h3 class="text-xl font-semibold mb-2">
              GitHub
            </h3>
            <p class="text-glass-muted">
              @x3huang
            </p>
          </div>
        </GlassCard>
      </a>

      <!-- LinkedIn -->
      <a href="https://linkedin.com/in/x3huang" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard 
          variant="primary" 
          padding="lg" 
          radius="lg" 
          hover
          clickable
          class="text-center h-full"
        >
          <div class="text-glass">
            <div class="text-4xl mb-4">💼</div>
            <h3 class="text-xl font-semibold mb-2">
              LinkedIn
            </h3>
            <p class="text-glass-muted">
              /in/x3huang
            </p>
          </div>
        </GlassCard>
      </a>

      <!-- Resume -->
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" class="block group">
        <GlassCard 
          variant="primary" 
          padding="lg" 
          radius="lg" 
          hover
          clickable
          class="text-center h-full"
        >
          <div class="text-glass">
            <div class="text-4xl mb-4">📄</div>
            <h3 class="text-xl font-semibold mb-2">
              Resume
            </h3>
            <p class="text-glass-muted">
              Download CV
            </p>
          </div>
        </GlassCard>
      </a>
    </div>

    <!-- Contact form -->
    <GlassCard variant="primary" padding="lg" radius="lg" class="max-w-2xl mx-auto">
      <h3 class="text-2xl font-semibold text-glass mb-6 text-center">
        Send a Message
      </h3>
      
      <form @submit.prevent="submitForm" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-glass mb-2">
            Name
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            placeholder="Your name"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-glass mb-2">
            Email
          </label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label for="subject" class="block text-sm font-medium text-glass mb-2">
            Subject
          </label>
          <input
            id="subject"
            v-model="form.subject"
            type="text"
            required
            class="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            placeholder="What's this about?"
          />
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-glass mb-2">
            Message
          </label>
          <textarea
            id="message"
            v-model="form.message"
            required
            rows="5"
            class="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/40"
            placeholder="Your message..."
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium drop-shadow-lg"
        >
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </button>
      </form>

      <div v-if="submitted" class="mt-4 p-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-center drop-shadow-lg">
        Your email client should have opened with the message. If not, please send an email directly to hello@x3huang.dev
      </div>
    </GlassCard>

    <!-- Back navigation -->
    <div class="text-center mt-8">
      <NuxtLink 
        to="/" 
        class="inline-flex items-center gap-2 text-glass hover:text-glass-muted transition-colors"
      >
        <IconsArrowLeft class="w-4 h-4" />
        Back to Home
      </NuxtLink>
    </div>
  </BackgroundLayout>
</template>

<script setup lang="ts">
import GlassCard from '~/components/ui/GlassCard.vue'
import BackgroundLayout from '~/components/layouts/BackgroundLayout.vue'
import PageHeader from '~/components/ui/PageHeader.vue'
import IconsArrowLeft from '~/components/icons/arrowLeft.vue'

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const submitted = ref(false)

const submitForm = async () => {
  isSubmitting.value = true
  
  // Create mailto link with form data
  const subject = encodeURIComponent(form.value.subject || 'Message from your website')
  const body = encodeURIComponent(
    `Name: ${form.value.name}\n` +
    `Email: ${form.value.email}\n\n` +
    `Message:\n${form.value.message}`
  )
  
  const mailtoLink = `mailto:hello@x3huang.dev?subject=${subject}&body=${body}`
  
  // Open email client
  window.location.href = mailtoLink
  
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }
  
  isSubmitting.value = false
  submitted.value = true
  
  // Hide success message after 5 seconds
  setTimeout(() => {
    submitted.value = false
  }, 5000)
}

useHead({
  title: 'Contact - Xinyu Huang',
  meta: [
    { name: 'description', content: 'Get in touch with Xinyu Huang. Reach out for collaborations, questions, or just to say hello!' }
  ]
})
</script>