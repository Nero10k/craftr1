interface LinkedInCredentials {
  accessToken: string
  organizationId: string
}

interface LinkedInPost {
  author: string
  lifecycleState: string
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: {
        text: string
      }
      shareMediaCategory: 'NONE'
    }
  }
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
  }
}

export async function publishToLinkedIn(content: string, credentials: LinkedInCredentials) {
  try {
    const post: LinkedInPost = {
      author: `urn:li:organization:${credentials.organizationId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(post)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to publish to LinkedIn')
    }

    const data = await response.json()
    return data.id // Returns the LinkedIn post ID
  } catch (error) {
    console.error('LinkedIn publish error:', error)
    throw error
  }
}

export async function getPostAnalytics(postId: string, credentials: LinkedInCredentials) {
  try {
    const response = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${credentials.organizationId}&shares[0]=urn:li:share:${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch LinkedIn analytics')
    }

    const data = await response.json()
    const stats = data.elements[0]

    return {
      views: stats.totalShareStatistics.impressionCount || 0,
      likes: stats.totalShareStatistics.likeCount || 0,
      comments: stats.totalShareStatistics.commentCount || 0,
      shares: stats.totalShareStatistics.shareCount || 0,
      clickThroughRate: stats.totalShareStatistics.clickCount ? 
        stats.totalShareStatistics.clickCount / stats.totalShareStatistics.impressionCount : 0,
      engagementRate: stats.totalShareStatistics.engagement || 0,
      impressions: stats.totalShareStatistics.impressionCount || 0
    }
  } catch (error) {
    console.error('LinkedIn analytics error:', error)
    throw error
  }
}

export async function verifyCredentials(credentials: LinkedInCredentials): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.linkedin.com/v2/organizations/${credentials.organizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        }
      }
    )

    return response.ok
  } catch {
    return false
  }
} 