import streamlit as st
import base64
import gc
import brand_monitoring_flow.main

# ===========================
#   Streamlit Setup
# ===========================

if "response" not in st.session_state:
    st.session_state.response = None

if "flow" not in st.session_state:
    st.session_state.flow = None

if "deep_seek_image" not in st.session_state:
    st.session_state.deep_seek_image = base64.b64encode(open("assets/deep-seek.png", "rb").read()).decode()
if "brightdata_image" not in st.session_state:
    st.session_state.brightdata_image = base64.b64encode(open("assets/brightdata.png", "rb").read()).decode()

def reset_analysis():
    st.session_state.response = None
    st.session_state.flow = None
    gc.collect()


def start_analysis():
    st.markdown("""
            # Brand Monitoring powered by <img src="data:image/png;base64,{}" width="180" style="vertical-align: -7px;"> & <img src="data:image/png;base64,{}" width="180" style="vertical-align: -10px;">
        """.format(
            st.session_state.deep_seek_image,
            st.session_state.brightdata_image
        ), unsafe_allow_html=True)
    
    # Create a placeholder for status updates
    status_placeholder = st.empty()
    
    with status_placeholder.container():
        if st.session_state.flow is None:
            status_placeholder.info('Initializing brand monitoring flow...')
            st.session_state.flow = brand_monitoring_flow.main.BrandMonitoringFlow()
        
            st.session_state.flow.state.brand_name = st.session_state.brand_name
            st.session_state.flow.state.total_results = st.session_state.total_results
            
            # You can update the status for different phases
            status_placeholder.info('Scraping latest data about {} and analyzing with AI Agents...'.format(st.session_state.brand_name))
            st.session_state.flow.kickoff()
            
            # Store the results
            status_placeholder.success('Analysis complete! Displaying results...')
            st.session_state.response = st.session_state.flow.state
        else:
            st.session_state.response = st.session_state.flow.state

    # Clear the status message after completion
    status_placeholder.empty()

# ===========================
#   Sidebar
# ===========================
with st.sidebar:
    st.header("Brand Monitoring Settings")
    
    # Brand name input
    st.session_state.brand_name = st.text_input(
        "Company/Brand Name",
        value="Hugging Face" if "brand_name" not in st.session_state else st.session_state.brand_name
    )
    
    # Number of search results
    st.session_state.total_results = st.number_input(
        "Total Search Results",
        min_value=1,
        max_value=50,
        value=15,
        step=1
    )

    st.divider()
    
    # Analysis buttons
    col1, col2 = st.columns(2)
    with col1:
        st.button("Start Analysis 🚀", type="primary", on_click=start_analysis)
    with col2:
        st.button("Reset", on_click=reset_analysis)

# ===========================
#   Main Content Area
# ===========================

# Move the header inside a container to ensure it stays at the top

if st.session_state.response is None:
    header_container = st.container()
    with header_container:
        st.markdown("""
            # Brand Monitoring powered by <img src="data:image/png;base64,{}" width="180" style="vertical-align: -7px;"> & <img src="data:image/png;base64,{}" width="180" style="vertical-align: -10px;">
        """.format(
            st.session_state.deep_seek_image,
            st.session_state.brightdata_image
        ), unsafe_allow_html=True)

if st.session_state.response:
    try:
        response = st.session_state.response
        
        # LinkedIn Results
        if response.linkedin_crew_response:
            st.markdown("## 💼 LinkedIn Mentions")
            for post in response.linkedin_crew_response.pydantic.content:
                with st.expander(f"📝 {post.post_title}"):
                    st.markdown(f"**Source:** [{post.post_link}]({post.post_link})")
                    for line in post.content_lines:
                        st.markdown(f"- {line}")
        
        # Instagram Results
        if response.instagram_crew_response:
            st.markdown("## 📸 Instagram Mentions")
            for post in response.instagram_crew_response.pydantic.content:
                with st.expander(f"📝 {post.post_title}"):
                    st.markdown(f"**Source:** [{post.post_link}]({post.post_link})")
                    for line in post.content_lines:
                        st.markdown(f"- {line}")
        
        # YouTube Results
        if response.youtube_crew_response:
            st.markdown("## 🎥 YouTube Mentions")
            for video in response.youtube_crew_response.pydantic.content:
                with st.expander(f"📝 {video.video_title}"):
                    st.markdown(f"**Source:** [{video.video_link}]({video.video_link})")
                    for line in video.content_lines:
                        st.markdown(f"- {line}")
        
        # X/Twitter Results
        if response.x_crew_response:
            st.markdown("## 🐦 X/Twitter Mentions")
            for post in response.x_crew_response.pydantic.content:
                with st.expander(f"📝 {post.post_title}"):
                    st.markdown(f"**Source:** [{post.post_link}]({post.post_link})")
                    for line in post.content_lines:
                        st.markdown(f"- {line}")
        
        # Web Results
        if response.web_crew_response:
            st.markdown("## 🌐 Web Mentions")
            for page in response.web_crew_response.pydantic.content:
                with st.expander(f"📝 {page.page_title}"):
                    st.markdown(f"**Source:** [{page.page_link}]({page.page_link})")
                    for line in page.content_lines:
                        st.markdown(f"- {line}")

    except Exception as e:
        st.error(f"An error occurred while displaying results: {str(e)}")

# Footer
st.markdown("---")
st.markdown("Built with CrewAI, Bright Data and Streamlit") 