const addSubscriber = () => {
    // Basic validation
    const newItemText = document.getElementById('new-subscriber').value
    if (newItemText.trim() === '') {
        alert('Please enter a YouTube Channel!')
        return
    }

    // Add item on page
    addItemOnPage(newItemText)

    // Clear the input field
    document.getElementById('new-subscriber').value = ''
}

// Save the items to Chrome's sync storage
const saveOptions = () => {
    const itemList = document.getElementById('subscriber-list')
    const subscribers = []
    for (let i = 0; i < itemList.children.length; i++) {
        // Children are the remove button and the span
        // The span contains the subscriber name
        const li = itemList.children[i]
        const span = li.children[1]
        const subscriber = span.innerHTML
        subscribers.push(subscriber)
    }

    chrome.storage.sync.set({ subscriberList: subscribers }, () => {
        alert('Subscriber list saved!')
    })
}

const loadOptions = () => {
    chrome.storage.sync.get(['subscriberList'], (result) => {
        const subscribers = result.subscriberList
        if (!subscribers) {
            return
        }
        for (let i = 0; i < subscribers.length; i++) {
            const subscriber = subscribers[i]
            addItemOnPage(subscriber)
        }
    })
}

const addItemOnPage = (subscriber) => {
    const itemList = document.getElementById('subscriber-list')
    const li = document.createElement('li')

    const span = document.createElement('span')
    span.textContent = subscriber

    const removeButton = document.createElement('button')
    removeButton.className = 'removeButton'
    removeButton.textContent = 'X'
    removeButton.onclick = () => {
        removeItemOnPage(li)
    }

    li.appendChild(removeButton)
    li.appendChild(span)

    itemList.appendChild(li)
}

const removeItemOnPage = (listItem) => {
    listItem.remove()
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadOptions)
document.getElementById('save').addEventListener('click', saveOptions)
document.getElementById('add').addEventListener('click', addSubscriber)
document.getElementById('new-subscriber').addEventListener('keydown', (keyboardEvent) => {
    if (keyboardEvent.key === 'Enter') {
        addSubscriber()
    }
})
