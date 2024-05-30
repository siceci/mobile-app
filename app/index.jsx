
import { ScrollView, StyleSheet, Text, View, Image} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Redirect, router } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../constants'
import CustomButton from './components/CustomButton'


export default function App() {
  return (
    //blackground color
    <SafeAreaView className="bg-black h-full"> 
    <ScrollView contentContainerStyle={{ height: '100%'}}>
    <View className="w-full justify-center items-center h-full px-4">

    {/* Splash Logo */}
    <Image 
        source={images.logo}
        // className="w-[130px] h-[84px]"
        // resizeMode="contain"
    />

    {/* Text Title*/}
    <View className="relative mt-5">
    <Text className="text-3xl text-white font-bold text-center">
    Discover Endeless Possibilities with {''}
    <Text className="text-orange-500"> Aora</Text>
    </Text>

    {/* Subtitle */}
    <Text className="text-white text-center mt-6 text-xl mb-6">
    Where creativity meets innvation: embark on a journey of limitless exploration with Aora
    </Text>


    <CustomButton
    title="Continue with Email"
    handlePress={() => router.push('/sign-in')}
    constainerStyles="w-full mt-7"
    ></CustomButton>


    </View>

    </View>

    </ScrollView>
    <StatusBar backgroundColor='#161622'
        style='light'
    />
    </SafeAreaView>
  )
}
