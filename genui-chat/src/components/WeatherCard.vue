<script setup>

const props = defineProps({
    city: { type: String, default: '深圳' },
    weather: { type: String, default: '晴天'},
    temperature: { type: [Number, String], default: '26' },
    tips: { type: String, default: '' },
})

</script>

<template>
    <div class="weather">
        <div class="weather-city">{{ props.city }}</div>
        <div class="weather-main">
            <span class="weather-type">{{ props.weather }}</span>
            <span class="weather-temp">{{ props.temperature }} </span>
        </div>
        <div class="weather-tips">{{ props.tips }}</div>
    </div>
</template>

<style scoped>
.weather {
  min-width: 220px;
  padding: 16px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
}
.weather-city {
  font-size: 14px;
  opacity: 0.9;
}
.weather-main {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 8px 0;
}
.weather-type {
  font-size: 26px;
  font-weight: 600;
}
.weather-temp {
  font-size: 18px;
}
.weather-tips {
  font-size: 12px;
  opacity: 0.85;
}
</style>