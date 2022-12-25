export const getCurrentWeather = async (latitude: number, longitude: number) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=ee54622fdcf267f0abb0f4e86e381682`
  const response = await fetch(url)
  if (!response.ok) throw new Error(await response.text())
  return await response.json()
}
