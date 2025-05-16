<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { onMounted, ref } from 'vue'
import { io } from "socket.io-client";

// const socket = io("ws://localhost:3000");
const socket = io("wss://localhost:3000");
const _payload = ref([]);
onMounted(() => {
  console.log(socket);
  if (!socket) return;
  socket.on('notification', payload => {
    console.log(payload)
    _payload.value.push(payload);
  });
  socket.on(socket.id, payload => {
    console.log(payload)
    // alert('Logout')
    // logout action
    // _payload.value.push(payload);
  });
  socket.on('logout', payload => {
    console.log(payload)
    alert('Logout')
    // logout action
    // _payload.value.push(payload);
  });
});

const onClick = () => {
  socket.emit('client-msg', 'LOGOUT');
}

</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <div class="wrapper">
      <div>
        {{ _payload }}
      </div>
      <button @click="onClick">
        Click Me
      </button>
      <!-- <HelloWorld msg="You did it!" /> -->
    </div>
  </header>

  <main>
    <!-- <TheWelcome /> -->
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
