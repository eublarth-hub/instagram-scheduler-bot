const { v4: uuidv4 } = require('uuid');

async function publishToInstagram(publication, account) {
  if (!account || !account.accessToken) {
    throw new Error('Instagram account is not connected or token is missing.');
  }

  if (!publication.mediaUrl && !publication.caption) {
    throw new Error('Publication is missing media URL or caption.');
  }

  // Simulated IG upload for MVP. Replace this with the real Instagram Graph API call.
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    remoteId: `ig_${uuidv4()}`,
    message: `Publication published to ${account.username} successfully.`
  };
}

module.exports = { publishToInstagram };
