import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../../constants'

const FormField = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-lg font-semibold text-white">
      {title}
      </Text>

      <View className="border-2 border-teal-950 w-full h-16 px-4
       bg-teal-950 rounded-2xl focus:border-orange-200 items-center flex-row">
        <TextInput
            className="flex-1 text-white  text-lg"
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#7b7b8b"
            onChangeText={handleChangeText}
            secureTextEntry={title === 'Password' && !showPassword}
        />
        {title === 'Password' && (
          <TouchableOpacity onPress= {() => setShowPassword(!showPassword)}>
            <Image source={showPassword ? icons.eyeHide : icons.eye}
              className="w-6 h-6" resizeMode='contain'
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField