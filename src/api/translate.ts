import { setCORS } from "google-translate-api-browser"
import { request } from "graphql-request"
import gql from "graphql-tag"
import pThrottle from "p-throttle"

export const TRANSLATE_QUERY = gql`
  query($source: String!) {
    translate(source: $source) {
      text
    }
  }
`

const translate = setCORS("http://cors.hjm.bid/")

export const translateWithLibrary = async (source: string) => {
  try {
    console.log(`Translating: ${source}`)
    const result: any = await translate(source, { to: "vi" })
    const text = result.text
    console.log(`Translated: ${text}`)
    return text
  } catch (err) {
    console.error(err)
    return null
  }
}

export const throttledTranslate = pThrottle(translateWithLibrary, 1, 15000)

export const translateWithGraphql = async (source: string) => {
  const response = await request(
    "http://192.168.192.99:4000/",
    (TRANSLATE_QUERY as unknown) as string,
    {
      source,
    },
  )
  return response.translate.text
}
