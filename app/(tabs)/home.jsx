import { ScrollView, View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {
  return (
<SafeAreaView className="bg-white h-full"> 
    <ScrollView contentContainerStyle={{ height: '100%'}}>
    <View className="w-full justify-center items-center h-full px-4">


    {/* Text Title*/}
    <View className="relative mt-5">
    <Text className="text-3xl text-black font-bold text-center">
    Testing {''}
    <Text className="text-orange-500"> Diu</Text>
    </Text>

    {/* Subtitle */}
    <Text className="text-white text-center mt-6 text-xl mb-6">
    Where creativity meets innvation: embark on a journey of limitless exploration with Aora
    </Text>



    </View>

    </View>

    </ScrollView>

    </SafeAreaView>
  )
}

export default Home