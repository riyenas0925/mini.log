import React from "react"
import { Helmet } from "react-helmet"
import { siteUrl } from "../../../blog-config"

const SEO = ({ title, description, url }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="naver-site-verification" content="174f75f02a460b0a118dac9de26fa60b730ae971" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
    </Helmet>
  )
}

export default SEO
