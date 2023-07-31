chrome.storage.sync.get(['subscriberList'], (result) => {
    const subscribers = result.subscriberList
    setTimeout(() => {
        const currentVideoOwnerElement = document.querySelector('.ytd-channel-name a')
        if (currentVideoOwnerElement === null) {
            console.error('Unable to find video owner')
            return
        }
        const currentVideoOwner = currentVideoOwnerElement.textContent
        if (subscribers.includes(currentVideoOwner)) {
            // TODO: Probably find a better way to get to the like button
            const likeButton = document.getElementById('segmented-like-button').children[0].children[0].children[0]
            if (likeButton === null) {
                console.error('Unable to find like button')
                return
            }
            // We don't want to un-like a video that's already liked! So we'll check to see if this video is already liked or not
            if (likeButton.ariaPressed === 'false') {
                likeButton.click()
            } else {
                console.log('Video already liked')
            }
        }
    }, 5000)
})
