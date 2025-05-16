<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import { onMounted, ref, watch } from 'vue'
import { io } from "socket.io-client";

const EVENTS = {
  REGISTER: 'REGISTER_SESSION',
  LOGOUT: 'LOGOUT_SESSION',
  NOTIFY:    'NOTIFICATION',
  // HEARTBEAT: 'HEARTBEAT',
  // ERROR:     'ERROR',
};

// const socket = io("ws://localhost:3000");
const socket = io("wss://localhost:3000");
const _payload = ref([]);
const _userId = ref(null);

const register = async () => {
  socket.emit(
    EVENTS.REGISTER,
    { userId: _userId.value, sessionId: crypto.randomUUID(), timestamp: Date.now() },
    (ack) => { // callback function
      if (ack.success) {
        console.log('Registered successfully:', ack.sessionId);
      } else {
        console.error('Registration failed:', ack.error);
      }
    }
  );
}

const stopWatcher = watch(_userId, newId => {
  if (!newId) return;

  // 1) when socket connects (or reconnects), register
  socket.on('connect', register);

  // 2) listen for notifications
  socket.on(EVENTS.NOTIFY, payload => {
    _payload.value.push(payload);
    alert('logout');
  });

  // If we're already connected, call register immediately
  if (socket.connected) register();

  // stop watching after initial setup
  stopWatcher();
});

onMounted(() => {
  // console.log(socket);
  // if (!socket) return;
  // if (!_userId.value) return;

  // socket.on('connect', () => {
  //   // register with the server: server will reply with a heartbeat ack
  //   // let sessionId = crypto.randomUUID();
  //   // console.log(sessionId);
  //   register();
  // });


  // socket.on('notification', payload => {
  //   console.log(payload)
  //   _payload.value.push(payload);
  // });


});

const onClick = () => {
  socket.emit('client-msg', { userId: _userId.value, msg: "LOGOUT" },
    (ack) => { // callback function
      // if (ack.success) {
      //   console.log('Registered successfully:', ack.sessionId);
      // } else {
      //   console.error('Registration failed:', ack.error);
      // }
    });
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
        Test Notify
      </button>
      <!-- <HelloWorld msg="You did it!" /> -->
      <div style="margin-left: 24px">
        <input type="text" v-model="_userId">

        <button @click="register">
          Register
        </button>
      </div>
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
