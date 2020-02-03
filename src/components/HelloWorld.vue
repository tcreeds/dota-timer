<template>
    <div class="hello">
        <h1>Dota Timer</h1>
        <div class="button-container">
            <button @click="startTimer()">Start</button>
            <button @click="stopTimer()">Stop</button>
            <button @click="resetTimer()">Reset</button>
        </div>
        <div class="time-container">
            Time: {{ gameTime }}
        </div>
        <div class="message-container">
            <div v-for="(message, index) in sortedMessages" v-bind:key="index" v-bind:class="{ fading: message.fading }">
                {{ ` ${message.text}` }}
            </div>
        </div>
        
    </div>
</template>

<script>
import { beep } from '../beep.js'

function seconds(seconds) {
    return seconds * 1000
}

function calcIterations(offset, interval, millis) {
    return Math.floor(Math.max(millis - offset, 0) / interval)
}

export default {
    name: 'HelloWorld',
    data(){
        return {
            startTime: null,
            currentTime: null,
            interval: null,
            messages: [],
            startOffset: seconds(30),
            timers: [
                {
                    name: "neutral creeps spawn in 30 seconds",
                    offset: seconds(60),
                    interval: seconds(60)
                },
                {
                    name: "bounty runes in 30 seconds",
                    offset: seconds(0),
                    interval: seconds(120)
                }
            ]
        }
    },
    computed: {
        sortedMessages: function (){
            return this.messages
                .filter(message => this.currentTime - message.time < seconds(55))
                .map(message => ({...message, fading: this.currentTime - message.time > seconds(45)}))
                .sort((a, b) => b.time - a.time)
        },
        gameTime: function (){
            const totalSeconds = Math.floor(((this.currentTime - this.startTime) - this.startOffset) / 1000)
            const mins = Math.floor(totalSeconds/60)
            const secs = Math.abs(totalSeconds%60) < 10 ? `0${Math.abs(totalSeconds%60)}` : Math.abs(totalSeconds%60)
            return `${mins < 0 ? "-0" : mins}:${secs}`
        }
    },
    methods: {
        startTimer(){
            this.startTime = Date.now()
            this.currentTime = Date.now()
            this.interval = setInterval(() => {
                if (this.interval) {
                    const now = Date.now()
                    this.checkTimes(now)
                    this.currentTime = now
                }
            }, 10)
        },
        stopTimer(){
            clearInterval(this.interval)
            this.interval = null
        },
        resetTimer(){
            this.startTime = null
            this.currentTime = null
        },
        checkTimes(now){
            this.timers.forEach(time => {
                const prior = calcIterations(time.offset, time.interval, this.currentTime - this.startTime)
                const current = calcIterations(time.offset, time.interval, now - this.startTime)
                if (prior === current - 1){
                    this.messages.push({
                        time: now,
                        text: time.name
                    })
                    beep(50, 440, 1, "square")
                    
                }
            })
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.button-container {
    margin-bottom: 1em;
}
.button-container > button {
    font-size: 1.5em;
    margin: 0.5em;
}
.time-container {
    font-size: 2em;
}
.message-container > .fading {
    animation: example 2s;
}
@keyframes example {
  from {color: black;}
  to {color: white;}
}
</style>
