import discord
import json
import asyncio
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv('../server/.env')
# Bot setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

client = discord.Client(intents=intents)

# Configuration
TARGET_USER_ID = 209157513482862593  # Harcdcoded user id 209157513482862593 for ethan
BOT_TOKEN = os.getenv('BOT_TOKEN')   # Access from .env
OUTPUT_FILE = "user_messages.json"

# Data storage
user_messages = []

@client.event
async def on_ready():
    print(f'{client.user} has connected to Discord!')
    print(f'Bot is in {len(client.guilds)} servers')
    
    # Start collecting messages
    await collect_user_messages()
    
    # Save and exit
    save_messages()
    await client.close()

# Remove any event handlers that might respond to messages

async def collect_user_messages():
    """Collect all messages from the target user across all accessible channels"""
    total_messages = 0
    
    for guild in client.guilds:
        print(f"\n--- Scanning server: {guild.name} ---")
        
        for channel in guild.text_channels:
            try:
                # Check if bot can read this channel
                permissions = channel.permissions_for(guild.me)
                if not permissions.read_message_history:
                    print(f"❌ No permission to read {channel.name}")
                    continue
                
                print(f"📂 Scanning #{channel.name}...")
                channel_count = 0
                
                # Fetch message history
                async for message in channel.history(limit=None, oldest_first=True):
                    if message.author.id == TARGET_USER_ID:
                        message_data = {
                            'id': message.id,
                            'content': message.content,
                            'timestamp': message.created_at.isoformat(),
                            'channel': channel.name,
                            'channel_id': channel.id,
                            'guild': guild.name,
                            'guild_id': guild.id,
                            'attachments': [att.url for att in message.attachments],
                            'embeds': len(message.embeds),
                            'reactions': [{'emoji': str(reaction.emoji), 'count': reaction.count} 
                                        for reaction in message.reactions]
                        }
                        user_messages.append(message_data)
                        channel_count += 1
                        total_messages += 1
                        
                        # Progress indicator
                        if total_messages % 100 == 0:
                            print(f"💬 Collected {total_messages} messages so far...")
                
                if channel_count > 0:
                    print(f"✅ Found {channel_count} messages in #{channel.name}")
                    
            except discord.Forbidden:
                print(f"❌ Access denied to #{channel.name}")
            except Exception as e:
                print(f"❌ Error in #{channel.name}: {str(e)}")
    
    print(f"\n🎉 Collection complete! Found {total_messages} total messages from user.")

def save_messages():
    """Save collected messages to JSON file"""
    if not user_messages:
        print("❌ No messages collected!")
        return
    
    # Sort messages by timestamp
    user_messages.sort(key=lambda x: x['timestamp'])
    
    # Create summary data
    summary = {
        'target_user_id': TARGET_USER_ID,
        'collection_date': datetime.now().isoformat(),
        'total_messages': len(user_messages),
        'date_range': {
            'oldest': user_messages[0]['timestamp'] if user_messages else None,
            'newest': user_messages[-1]['timestamp'] if user_messages else None
        },
        'channels_found': len(set(msg['channel_id'] for msg in user_messages)),
        'servers_found': len(set(msg['guild_id'] for msg in user_messages))
    }
    
    # Save to file
    output_data = {
        'summary': summary,
        'messages': user_messages
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved {len(user_messages)} messages to {OUTPUT_FILE}")
    print(f"📊 Summary:")
    print(f"   • Messages: {summary['total_messages']}")
    print(f"   • Channels: {summary['channels_found']}")
    print(f"   • Servers: {summary['servers_found']}")
    if user_messages:
        print(f"   • Date range: {summary['date_range']['oldest'][:10]} to {summary['date_range']['newest'][:10]}")

# Command to run specific channel
async def collect_from_channel(channel_id):
    """Collect messages from a specific channel only"""
    channel = client.get_channel(channel_id)
    if not channel:
        print(f"❌ Channel {channel_id} not found")
        return
    
    print(f"📂 Collecting from #{channel.name} only...")
    count = 0
    
    async for message in channel.history(limit=None):
        if message.author.id == TARGET_USER_ID:
            # Same message processing as above
            count += 1
    
    print(f"✅ Found {count} messages in this channel")

if __name__ == "__main__":
    print("🤖 Discord User Message Collector")
    print("=" * 40)
    print(f"   • TARGET_USER_ID (currently: {TARGET_USER_ID})")
    print("\n🚀 Starting collection...")
    
    # Run the bot
    client.run(BOT_TOKEN)