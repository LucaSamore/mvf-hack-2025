import json

class FerrariChatScraper:
    def __init__(self):
        self.base_url = "https://www.ferrarichat.com/forum"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    def search_threads(self, search_url):
        """Search for threads and extract their URLs, handling pagination"""
        threads = []
        current_page = 1
        
        while True:
            try:
                # Construct page URL
                if current_page == 1:
                    page_url = search_url
                else:
                    page_url = f"{search_url}&page={current_page}"
                
                print(f"Searching page {current_page}...")
                
                response = requests.get(page_url, headers=self.headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all search results
                search_results = soup.find_all('li', class_='searchResult')
                
                if not search_results:
                    break
                
                for result in search_results:
                    # Get the title element
                    title_element = result.find('h3', class_='title')
                    if not title_element:
                        continue
                        
                    # Get the link
                    link = title_element.find('a')
                    if not link:
                        continue
                        
                    # Get the timestamp
                    timestamp_element = result.find('abbr', class_='DateTime')
                    timestamp = timestamp_element.get('title', '') if timestamp_element else ''
                    
                    # Get the forum name
                    forum_element = result.find('a', href=re.compile(r'forums/'))
                    forum = forum_element.text if forum_element else ''
                    
                    # Get the post/thread ID
                    result_id = result.get('id', '')
                    if result_id.startswith('thread-'):
                        content_type = 'thread'
                        content_id = result_id.replace('thread-', '')
                    elif result_id.startswith('post-'):
                        content_type = 'post'
                        content_id = result_id.replace('post-', '')
                    else:
                        continue
                    
                    # Get the snippet content
                    snippet_element = result.find('blockquote', class_='snippet')
                    snippet = snippet_element.find('a').text if snippet_element and snippet_element.find('a') else ''
                    
                    # Get the author
                    author_element = result.find('a', class_='username')
                    author = author_element.text if author_element else ''
                    
                    # Construct the URL
                    if content_type == 'thread':
                        url = f"{self.base_url}/{link['href']}"
                    else:
                        url = f"{self.base_url}/posts/{content_id}/"
                    
                    # Add to threads list if not already present
                    if url not in [t['url'] for t in threads]:
                        threads.append({
                            'url': url,
                            'title': link.text.strip(),
                            'timestamp': timestamp,
                            'forum': forum,
                            'type': content_type,
                            'id': content_id,
                            'snippet': snippet,
                            'author': author,
                            'posts': []  # Will be populated for threads
                        })
                
                # Check if there's a next page
                next_link = soup.find('a', class_='nextLink')
                if not next_link:
                    break
                    
                current_page += 1
                time.sleep(2)  # Be nice to the server
                
            except Exception as e:
                print(f"Error searching page {current_page}: {str(e)}")
                break
        
        print(f"Found {len(threads)} unique threads/posts")
        return threads
    
    def get_thread_posts(self, thread_url):
        """Scrape timestamps from a thread"""
        posts = []
        current_page = 1
        
        while True:
            if current_page == 1:
                page_url = thread_url
            else:
                page_url = f"{thread_url}/page-{current_page}"
            
            print(f"Scraping page {current_page}...")
            
            try:
                response = requests.get(page_url, headers=self.headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Find all posts on the page
                post_elements = soup.find_all('li', class_='message')
                
                if not post_elements:
                    break
                
                for post in post_elements:
                    post_data = self._extract_post_data(post)
                    if post_data:
                        posts.append(post_data)
                
                # Check if there's a next page
                next_page = soup.find('a', class_='PageNavLink--next')
                if not next_page:
                    break
                    
                current_page += 1
                time.sleep(2)  # Be nice to the server
                
            except Exception as e:
                print(f"Error scraping page {current_page}: {str(e)}")
                break
                
        return posts
    
    def _extract_post_data(self, post_element):
        """Extract timestamp data from a post element"""
        try:
            # Get post ID
            post_id = post_element.get('id', '').replace('post-', '')
            
            # Get timestamp
            timestamp_element = post_element.find('span', class_='DateTime')
            timestamp = timestamp_element.get('title', '') if timestamp_element else ''
            
            # Get created date from user info
            created_date_element = post_element.find('dl', class_='pairsJustified')
            created_date = created_date_element.find('dd').string if created_date_element else ''
            
            # Get author
            author_element = post_element.find('a', class_='username')
            author = author_element.text if author_element else ''
            
            # Get content - look for the article element first
            content_element = post_element.find('article', class_='message-body')
            if not content_element:
                # Fallback to messageContent div
                content_element = post_element.find('div', class_='messageContent')
            
            # Extract content text, handling both article and div cases
            if content_element:
                # Remove any quote blocks first
                for quote in content_element.find_all('div', class_='bbCodeBlock'):
                    quote.decompose()
                
                # Get the remaining text
                content = content_element.get_text(strip=True, separator=' ')
            else:
                content = ''
            
            return {
                'post_id': post_id,
                'timestamp': timestamp,
                'created_date': created_date,
                'author': author,
                'content': content
            }
            
        except Exception as e:
            print(f"Error extracting post data: {str(e)}")
            return None

    def scrape_search_results(self, search_url, output_file='ferrarichat_data.json'):
        """Main method to scrape search results and their associated posts"""
        # Get thread URLs from search
        print("Searching for threads...")
        search_results = self.search_threads(search_url)
        
        # Scrape posts from each thread
        for result in search_results:
            print(f"\nScraping thread: {result['url']}")
            posts = self.get_thread_posts(result['url'])
            result['posts'] = posts

        # Save results to JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(search_results, f, indent=2, ensure_ascii=False)
        
        print(f"Finished! Data saved to {output_file}")
        return search_results
