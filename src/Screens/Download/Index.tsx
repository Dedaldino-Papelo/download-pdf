import { View, Text, Alert, Platform } from 'react-native'
import React, { useState } from 'react'

import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"

import { styles } from './styles'
import Button from '../../Components/Button/Index'

const PDF_URI = {
  SAMPLE: "https://www.thecampusqdl.com/uploads/files/pdf_sample_2.pdf",
  FLORI: "https://www.mcfadden.com.br/assets/pdf/Flofi.pdf"
}

const PDF_NAME = "doc.pdf"

const Download = () => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [ percentageProgress, setPercentageProgress ] = useState(0)

  const onDownloadProgress = ({ totalBytesExpectedToWrite, totalBytesWritten }: FileSystem.DownloadProgressData) => {
    console.log(totalBytesWritten, totalBytesExpectedToWrite)
    
    const percentage = (totalBytesWritten / totalBytesWritten) * 100
    setPercentageProgress(percentage)
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      const fileUri = FileSystem.documentDirectory + PDF_NAME
      const downloadResumable = FileSystem.createDownloadResumable(
        PDF_URI.SAMPLE,
        fileUri,
        {},
        onDownloadProgress
      )

      const downloadResponse = await downloadResumable.downloadAsync()
      
      if(downloadResponse?.uri){
        await fileSave(downloadResponse.uri, PDF_NAME)
        
        setIsDownloading(false)
        setPercentageProgress(0)
      }
      
    } catch (error) {
      Alert.alert("Download", "Não foi possivel fazer o download")
    }
  }

  const fileSave = async (uri: string, filename: string) => {
    if(Platform.OS === "android"){
      const directoryUri = FileSystem.cacheDirectory + filename

      const base64File = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      })

      await FileSystem.writeAsStringAsync(directoryUri, base64File, {
        encoding: FileSystem.EncodingType.Base64
      })

      Sharing.shareAsync(directoryUri)

    } else {
      Sharing.shareAsync(uri)
    }
  }

  return (
    <View style={styles.container}>
        <Button title="Download pdf" onPress={handleDownload} isLoading={isDownloading} />

        {percentageProgress > 0 && <Text style={styles.progress}>{ percentageProgress.toFixed(1) } %</Text>}
    </View>
  )
}

export default Download