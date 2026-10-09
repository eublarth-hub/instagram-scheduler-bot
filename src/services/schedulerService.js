const { v4: uuidv4 } = require('uuid');

async function publishToInstagram(publication, account) {
  if (!account || !account.accessToken) {
    throw new Error('Instagram account is not connected or token is missing.');
  }

  if (!publication.mediaUrl && !publication.caption) {
    throw new Error('Publication is missing media URL or caption.');
  }

  const igUserId = account.igUserId || account.username;

  const createMediaResponse = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: publication.mediaUrl,
      caption: publication.caption || '',
      access_token: account.accessToken
    })
  });

  const createMediaData = await createMediaResponse.json();

  if (!createMediaData.id) {
    throw new Error(`Media creation failed: ${JSON.stringify(createMediaData)}`);
  }

  const publishResponse = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      creation_id: createMediaData.id,
      access_token: account.accessToken
    })
  });

  const publishData = await publishResponse.json();

  if (!publishData.id) {
    throw new Error(`Publish failed: ${JSON.stringify(publishData)}`);
  }

  return {
    success: true,
    remoteId: publishData.id || `ig_${uuidv4()}`,
    message: `Publication published to Instagram successfully.`
  };
}

module.exports = { publishToInstagram };
