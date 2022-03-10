import React from "react"
import { Helmet } from "react-helmet"

const SEOExclude = () => {
  return (
    <Helmet>
      <meta name="robots" content="noindex" />
    </Helmet>
  )
}

export default SEOExclude
