import React from 'react'

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  )
}
