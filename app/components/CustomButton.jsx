import { TouchableOpacity, Text, Touchable } from 'react-native'
import React from 'react'

const CustomButton = ({title, handlePress, 
    containerStyles, textStyles, isLoading}) => { 
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    className={`bg-emerald-500 rounded-xl min-h-[62px] justify-center
    items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`} 
    disabled={isLoading}>
    <Text className={`text-black font-semibold text-lg ${textStyles}`}>
    {title}
    </Text>

    </TouchableOpacity>
  )
}

export default CustomButton