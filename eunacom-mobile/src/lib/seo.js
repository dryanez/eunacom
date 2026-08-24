import { useEffect } from 'react'

export function setPageSeo({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://www.eunacomapp.cl/og-image.png'
}) {
  if (typeof document === 'undefined') return

  if (title) {
    document.title = title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    const twTitle = document.querySelector('meta[name="twitter:title"]')
    if (twTitle) twTitle.setAttribute('content', title)
  }

  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', description)
    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)
    const twDesc = document.querySelector('meta[name="twitter:description"]')
    if (twDesc) twDesc.setAttribute('content', description)
  }

  if (canonical) {
    let cleanCanonical = canonical
    if (!cleanCanonical.startsWith('http')) {
      cleanCanonical = `https://www.eunacomapp.cl${cleanCanonical.startsWith('/') ? '' : '/'}${cleanCanonical}`
    } else if (cleanCanonical.startsWith('https://eunacomapp.cl')) {
      cleanCanonical = cleanCanonical.replace('https://eunacomapp.cl', 'https://www.eunacomapp.cl')
    }

    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', cleanCanonical)

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', cleanCanonical)
    const twUrl = document.querySelector('meta[name="twitter:url"]')
    if (twUrl) twUrl.setAttribute('content', cleanCanonical)
  }

  if (ogType) {
    const ogTypeTag = document.querySelector('meta[property="og:type"]')
    if (ogTypeTag) ogTypeTag.setAttribute('content', ogType)
  }

  if (ogImage) {
    const ogImgTag = document.querySelector('meta[property="og:image"]')
    if (ogImgTag) ogImgTag.setAttribute('content', ogImage)
    const twImgTag = document.querySelector('meta[name="twitter:image"]')
    if (twImgTag) twImgTag.setAttribute('content', ogImage)
  }
}

export function usePageSeo(config) {
  useEffect(() => {
    setPageSeo(config)
  }, [config.title, config.description, config.canonical, config.ogImage, config.ogType])
}
