
import { ScrollView, StyleSheet, Text, View, Image} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Redirect, router } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../constants'
import { FontSizeProvider } from './components/FontSizeContext';
import CustomButton from './components/CustomButton'


export default function App() {
  return (
    //blackground color
    <SafeAreaView style="#7BC9C8" className="bg-teal-500 h-full"> 
    <ScrollView contentContainerStyle={{ height: '100%'}}>
    <FontSizeProvider>
    <View className="w-full justify-center items-center h-full px-4">

    {/* Splash Logo */}
    <Image 
        source={images.logo}
        className="w-[400px] h-[180px]"
        resizeMode="contain"
    />

    {/* Text Title*/}
    <View className="relative mt-1">
    <Text className="text-3xl text-white font-bold text-center mb-10">
    Streamline Your Life              {''}
    <Text> with </Text>
    <Text className="text-orange-200 font-extrabold"> MyTask</Text>
    </Text>


    <CustomButton
    title="Continue with Email"
    handlePress={() => router.push('/sign-in')}
    constainerStyles="w-full mt-7"
    ></CustomButton>


    </View>

    </View>
    </FontSizeProvider>

    </ScrollView>
    <StatusBar backgroundColor='#161622'
        style='light'
    />
    </SafeAreaView>
  )
}
