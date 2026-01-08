// Toast notification system
const showToast = (message, type = 'success') => {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
};

const addSubscriber = () => {
    const input = document.getElementById('new-subscriber');
    const newItemText = input.value.trim();
    
    if (newItemText === '') {
        showToast('Please enter a YouTube channel!', 'error');
        return;
    }

    // Add item on page
    addItemOnPage(newItemText);

    // Clear the input field
    input.value = '';

    // Auto-save
    saveOptions();
};

// Generate YouTube channel URL from subscriber entry
const getChannelUrl = (subscriber) => {
    // Check if it looks like a handle (starts with @ or is a single word without spaces)
    const trimmed = subscriber.trim();
    const isHandle = trimmed.startsWith('@') || /^[a-zA-Z0-9_-]+$/.test(trimmed);
    
    if (isHandle) {
        // Remove @ if present and create handle URL
        const handle = trimmed.replace(/^@/, '');
        return `https://www.youtube.com/@${handle}`;
    } else {
        // It's a channel name - search with channel filter (sp=EgIQAg%3D%3D filters to channels only)
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmed)}&sp=EgIQAg%3D%3D`;
    }
};

// Save the items to Chrome's sync storage
const saveOptions = () => {
    const itemList = document.getElementById('subscriber-list');
    const subscribers = [];
    
    for (const li of itemList.children) {
        const link = li.querySelector('a');
        if (link) {
            subscribers.push(link.textContent);
        }
    }

    chrome.storage.sync.set({ subscriberList: subscribers }, () => {
        showToast('Saved!', 'success');
    });
};

const loadOptions = () => {
    chrome.storage.sync.get(['subscriberList'], (result) => {
        const subscribers = result.subscriberList;
        if (!subscribers) {
            return;
        }
        for (const subscriber of subscribers) {
            addItemOnPage(subscriber);
        }
    });
};

const addItemOnPage = (subscriber) => {
    const itemList = document.getElementById('subscriber-list');
    const li = document.createElement('li');

    const link = document.createElement('a');
    link.textContent = subscriber;
    link.href = getChannelUrl(subscriber);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const removeButton = document.createElement('button');
    removeButton.className = 'removeButton';
    removeButton.innerHTML = '&times;';
    removeButton.onclick = () => {
        li.remove();
        saveOptions(); // Auto-save on remove
    };

    li.appendChild(removeButton);
    li.appendChild(link);
    itemList.appendChild(li);
};

// Event listeners
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('add').addEventListener('click', addSubscriber);
document.getElementById('new-subscriber').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addSubscriber();
    }
});
