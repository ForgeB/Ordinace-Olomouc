// Dental Clinic Website Loader
class DentalClinicLoader {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            this.loadMetadata();
            this.loadHeader();
            this.loadNavigation();
            this.loadFooter();
            this.initializeKontaktSection();
            this.initializeScrollSlideshow();
            this.initializeOrdinaceSection();
            this.initializeSluzbySection();
            this.setupMobileMenu();
            this.applyDesignSettings();
            this.addScrollEffect();
            
            // Add fade-in animation to header
            document.querySelector('.header').classList.add('fade-in');
            
            console.log('🦷 Dental Clinic website loaded successfully!');
        } catch (error) {
            console.error('❌ Error loading website:', error);
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load config:', error);
            throw error;
        }
    }

    loadMetadata() {
        if (!this.config.meta || !this.config.uvod) return;

        // Update page title
        document.title = this.config.uvod.title || 'Zubní Ordinace Olomouc';
        
        // Update meta tags
        this.updateMetaTag('description', this.config.uvod.description || '');
        this.updateMetaTag('keywords', this.config.meta.keywords || '');
        this.updateMetaTag('author', this.config.meta.author || '');
        
        // Update language attribute
        if (this.config.meta.language) {
            document.documentElement.lang = this.config.meta.language;
        }
    }

    updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        }
    }

    loadHeader() {
        if (!this.config.uvod) return;

        // Update site title
        const titleElement = document.getElementById('site-title');
        
        if (titleElement) {
            titleElement.textContent = this.config.uvod.title;
        }
    }

    loadFooter() {
        if (!this.config) return;

        // Load contact information
        if (this.config.kontakty) {
            const addressElement = document.getElementById('footer-address');
            const emergencyElement = document.getElementById('footer-emergency');
            
            if (addressElement) {
                addressElement.textContent = this.config.kontakty.adresa;
            }
            
            if (emergencyElement && this.config.kontakty.telefon) {
                emergencyElement.href = `tel:${this.config.kontakty.telefon}`;
            }
        }

        // Update copyright with clinic name
        if (this.config.uvod) {
            const copyrightElement = document.getElementById('footer-copyright');
            
            if (copyrightElement) {
                copyrightElement.textContent = this.config.uvod.title;
            }
        }

        // Load opening hours
        if (this.config.ordinacniHodiny) {
            this.loadOpeningHours();
        }
    }

    loadOpeningHours() {
        const hoursContainer = document.getElementById('opening-hours');
        if (!hoursContainer || !this.config.ordinacniHodiny) return;

        hoursContainer.innerHTML = '';

        this.config.ordinacniHodiny.forEach(dayInfo => {
            // Skip the note entry
            if (dayInfo.note) return;

            const dayElement = document.createElement('div');
            dayElement.className = 'hours-day';

            const dayName = document.createElement('span');
            dayName.className = 'day-name';
            dayName.textContent = dayInfo.day;

            const dayHours = document.createElement('span');
            dayHours.className = 'day-hours';

            // Format the hours
            let hoursText = '';
            if (dayInfo.morning === 'Zavřeno' || (!dayInfo.morning && !dayInfo.afternoon)) {
                hoursText = 'Zavřeno';
                dayHours.classList.add('closed');
            } else {
                const morning = dayInfo.morning || '';
                const afternoon = dayInfo.afternoon || '';
                
                if (morning && afternoon) {
                    hoursText = `${morning}, ${afternoon}`;
                } else if (morning) {
                    hoursText = morning;
                } else if (afternoon) {
                    hoursText = afternoon;
                }
            }

            dayHours.textContent = hoursText;

            dayElement.appendChild(dayName);
            dayElement.appendChild(dayHours);
            hoursContainer.appendChild(dayElement);
        });

        // Add note if exists
        const noteEntry = this.config.ordinacniHodiny.find(entry => entry.note);
        if (noteEntry) {
            const noteElement = document.createElement('div');
            noteElement.className = 'hours-note';
            noteElement.style.cssText = `
                margin-top: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 5px;
                font-size: 13px;
                font-style: italic;
                color: var(--text-light);
            `;
            noteElement.textContent = noteEntry.note;
            hoursContainer.appendChild(noteElement);
        }
    }

    initializeScrollSlideshow() {
        if (!this.config.images) return;

        // Filter images with category "main_board"
        const mainBoardImages = Object.values(this.config.images).filter(image => {
            return image.category === 'main_board';
        });
        
        if (mainBoardImages.length === 0) {
            console.log('No main board images found');
            return;
        }

        const slideWrapper = document.querySelector('.slide-wrapper');
        
        if (!slideWrapper) {
            console.log('Slide wrapper not found');
            return;
        }

        // Clear existing content
        slideWrapper.innerHTML = '';

        // Create slides
        mainBoardImages.forEach((imageData, index) => {
            const scrollSlide = document.createElement('div');
            scrollSlide.className = 'scroll-slide';

            // Create image container
            const slideImage = document.createElement('div');
            slideImage.className = 'slide-image';
            
            const img = document.createElement('img');
            img.src = imageData.src || imageData.path;
            img.alt = imageData.alt || imageData.description || `Slide ${index + 1}`;
            img.loading = 'lazy';
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn(`Failed to load image: ${img.src}`);
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNGY0ZjQiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+T2Jyw6F6ZWsgbmVuYWxlemVuPC90ZXh0Pjwvc3ZnPg==';
            });
            
            slideImage.appendChild(img);

            // Create content container
            const slideContent = document.createElement('div');
            slideContent.className = 'slide-content';
            
            const slideDescription = document.createElement('p');
            slideDescription.className = 'slide-description';
            slideDescription.textContent = imageData.description || `Popis obrázku ${index + 1}`;
            
            slideContent.appendChild(slideDescription);

            // Add to slide
            scrollSlide.appendChild(slideImage);
            scrollSlide.appendChild(slideContent);
            
            slideWrapper.appendChild(scrollSlide);
        });

        // Initialize scroll observer
        this.initializeScrollObserver();
        
        console.log(`📜 Loaded ${mainBoardImages.length} images in scroll slideshow`);
    }

    initializeScrollObserver() {
        const slides = document.querySelectorAll('.scroll-slide');
        
        if (slides.length === 0) return;
        
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-10% 0px -10% 0px'
        };

        const slideObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        slides.forEach(slide => {
            slideObserver.observe(slide);
        });
    }

    initializeOrdinaceSection() {
        if (!this.config.images) return;

        // Filter images with category "clinic_environment"
        const clinicImages = Object.values(this.config.images).filter(image => {
            return image.category === 'clinic_environment';
        });
        
        if (clinicImages.length === 0) {
            console.log('No clinic environment images found');
            return;
        }

        const ordinaceGrid = document.querySelector('.ordinace-grid');
        
        if (!ordinaceGrid) {
            console.log('Ordinace grid not found');
            return;
        }

        // Clear existing content
        ordinaceGrid.innerHTML = '';

        // Create ordinace items
        clinicImages.forEach((imageData, index) => {
            const ordinaceItem = document.createElement('div');
            ordinaceItem.className = 'ordinace-item';

            // Create image container
            const ordinaceImage = document.createElement('div');
            ordinaceImage.className = 'ordinace-image';
            
            const img = document.createElement('img');
            img.src = imageData.src || imageData.path;
            img.alt = imageData.alt || imageData.description || `Ordinace ${index + 1}`;
            img.loading = 'lazy';
            
            // Add error handling
            img.addEventListener('error', () => {
                console.warn(`Failed to load ordinace image: ${img.src}`);
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNGY0ZjQiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+T2Jyw6F6ZWsgbmVuYWxlemVuPC90ZXh0Pjwvc3ZnPg==';
            });
            
            ordinaceImage.appendChild(img);

            // Create content container
            const ordinaceContent = document.createElement('div');
            ordinaceContent.className = 'ordinace-content';
            
            const ordinaceDescription = document.createElement('p');
            ordinaceDescription.className = 'ordinace-description';
            ordinaceDescription.textContent = imageData.description || `Popis ordinace ${index + 1}`;
            
            ordinaceContent.appendChild(ordinaceDescription);

            // Add to item
            ordinaceItem.appendChild(ordinaceImage);
            ordinaceItem.appendChild(ordinaceContent);
            
            ordinaceGrid.appendChild(ordinaceItem);
        });

        // Initialize scroll observer for ordinace items
        this.initializeOrdinaceObserver();
        
        console.log(`🏥 Loaded ${clinicImages.length} clinic environment images`);
    }

    initializeOrdinaceObserver() {
        const ordinaceItems = document.querySelectorAll('.ordinace-item');
        
        if (ordinaceItems.length === 0) return;
        
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '-5% 0px -5% 0px'
        };

        const ordinaceObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        ordinaceItems.forEach(item => {
            ordinaceObserver.observe(item);
        });
    }

    loadNavigation() {
        if (!this.config.navbar || !this.config.navbar.items) return;

        const navMenu = document.getElementById('navbar-menu');
        if (!navMenu) return;

        // Clear existing navigation
        navMenu.innerHTML = '';

        // Create navigation items
        this.config.navbar.items.forEach((item, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            
            a.href = item.link;
            a.textContent = item.name;
            
            // Add active class to first item by default
            if (index === 0) {
                a.classList.add('active');
            }
            
            // Special handling for phone links
            if (item.link.startsWith('tel:')) {
                a.classList.add('phone-link');
                a.innerHTML = `<i class="fas fa-phone"></i> ${item.name}`;
            }
            
            // Add click handler for smooth scrolling
            if (item.link.startsWith('#')) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.smoothScrollTo(item.link);
                    this.setActiveNav(a);
                });
            }
            
            li.appendChild(a);
            navMenu.appendChild(li);
        });
    }

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.navbar-nav');
        
        if (!toggle || !navMenu) return;

        toggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            toggle.classList.toggle('active');
            
            // Animate hamburger
            const hamburgers = toggle.querySelectorAll('.hamburger');
            hamburgers.forEach((line, index) => {
                if (toggle.classList.contains('active')) {
                    if (index === 0) line.style.transform = 'rotate(45deg) translate(6px, 6px)';
                    if (index === 1) line.style.opacity = '0';
                    if (index === 2) line.style.transform = 'rotate(-45deg) translate(6px, -6px)';
                } else {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on nav links
        navMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
                
                // Reset hamburger
                const hamburgers = toggle.querySelectorAll('.hamburger');
                hamburgers.forEach(line => {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                });
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
                
                // Reset hamburger
                const hamburgers = toggle.querySelectorAll('.hamburger');
                hamburgers.forEach(line => {
                    line.style.transform = 'none';
                    line.style.opacity = '1';
                });
            }
        });
    }

    applyDesignSettings() {
        if (!this.config.design) return;

        const root = document.documentElement;
        
        // Apply color scheme
        if (this.config.design.primary_color) {
            root.style.setProperty('--primary-color', this.config.design.primary_color);
        }
        
        if (this.config.design.secondary_color) {
            root.style.setProperty('--secondary-color', this.config.design.secondary_color);
        }
        
        if (this.config.design.accent_color) {
            root.style.setProperty('--accent-color', this.config.design.accent_color);
        }
        
        if (this.config.design.text_color) {
            root.style.setProperty('--text-color', this.config.design.text_color);
        }
        
        if (this.config.design.light_color) {
            root.style.setProperty('--light-color', this.config.design.light_color);
        }
        
        if (this.config.design.font_family) {
            root.style.setProperty('--font-family', this.config.design.font_family);
        }
    }

    addScrollEffect() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add shadow on scroll
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll (optional)
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Add CSS for scroll effect
        const style = document.createElement('style');
        style.textContent = `
            .header {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .header.scrolled {
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const elementPosition = element.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    setActiveNav(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.navbar-nav a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    // Utility method to get config data
    getConfig() {
        return this.config;
    }

    // Method to reload configuration
    async reloadConfig() {
        // Clean up existing slideshow
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
        }
        
        await this.loadConfig();
        this.loadMetadata();
        this.loadHeader();
        this.loadNavigation();
        this.loadFooter();
        this.loadSlideshow();
        this.applyDesignSettings();
    }

    initializeSluzbySection() {
        if (!this.config.sluzby || !this.config.sluzby.seznam || !this.config.images) return;

        const services = this.config.sluzby.seznam;
        const serviceSelect = document.getElementById('service-select');
        const serviceDisplay = document.getElementById('service-display');
        const serviceContent = document.getElementById('service-content');
        
        if (!serviceSelect || !serviceDisplay || !serviceContent) {
            console.log('Services elements not found');
            return;
        }

        // Clear existing options (keep the first default option)
        serviceSelect.innerHTML = '<option value="">Vyberte službu</option>';

        // Populate select dropdown with services
        services.forEach((service, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = service.nazev;
            serviceSelect.appendChild(option);
        });

        // Add change event listener to select dropdown
        serviceSelect.addEventListener('change', (e) => {
            const selectedIndex = e.target.value;
            this.selectServiceFromTable(selectedIndex);
        });

        console.log(`🛠️ Loaded ${services.length} services in dropdown`);
    }

    initializeKontaktSection() {
        if (!this.config.kontakty || !this.config.ordinacniHodiny) return;

        // Update contact information in the kontakt section
        const contactPhone = document.getElementById('contact-phone');
        const contactAddress = document.getElementById('contact-address');
        const contactHours = document.getElementById('contact-opening-hours');

        if (contactPhone) {
            contactPhone.textContent = this.config.kontakty.telefon;
            contactPhone.href = `tel:${this.config.kontakty.telefon.replace(/\s/g, '')}`;
        }

        if (contactAddress) {
            contactAddress.textContent = this.config.kontakty.adresa;
        }

        // Load opening hours in kontakt section
        if (contactHours) {
            contactHours.innerHTML = '';
            
            this.config.ordinacniHodiny.forEach((day) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'hours-day';

                const dayName = document.createElement('span');
                dayName.className = 'day-name';
                dayName.textContent = day.day;

                const dayHours = document.createElement('span');
                dayHours.className = 'day-hours';

                // Skip days that are closed or entries with notes
                if (day.note || (!day.morning && !day.afternoon)) {
                    return; // Skip this iteration
                }

                let hoursText = '';
                const morning = day.morning;
                const afternoon = day.afternoon;
                
                if (morning && afternoon) {
                    hoursText = `${morning}, ${afternoon}`;
                } else if (morning) {
                    hoursText = morning;
                } else if (afternoon) {
                    hoursText = afternoon;
                }

                dayHours.textContent = hoursText;

                dayElement.appendChild(dayName);
                dayElement.appendChild(dayHours);
                contactHours.appendChild(dayElement);
            });
        }

        console.log('📞 Kontakt section initialized');
    }

    selectServiceFromTable(index) {
        const services = this.config.sluzby.seznam;
        const serviceContent = document.getElementById('service-content');
        const serviceDisplay = document.getElementById('service-display');
        
        if (index === '' || index === null || index === undefined) {
            // No service selected - hide content
            serviceContent.classList.remove('show');
            serviceDisplay.classList.remove('show');
            return;
        }

        // Show selected service
        const selectedService = services[index];
        if (!selectedService) return;

        // Find corresponding image by key
        const serviceImage = this.findImageByKey(selectedService.key);
        
        // Update service content display
        const serviceImg = document.getElementById('selected-service-img');
        const serviceName = document.getElementById('selected-service-name');
        const serviceDescription = document.getElementById('selected-service-description');
        
        if (serviceImg && serviceImage) {
            serviceImg.src = serviceImage.src;
            serviceImg.alt = selectedService.nazev;
        } else if (serviceImg) {
            serviceImg.src = this.getPlaceholderImage();
            serviceImg.alt = selectedService.nazev;
        }
        
        if (serviceName) {
            serviceName.textContent = selectedService.nazev;
        }
        
        if (serviceDescription) {
            serviceDescription.textContent = selectedService.popis || selectedService.popis2 || 'Popis služby';
        }

        // Show content and display area
        serviceDisplay.classList.add('show');
        serviceContent.classList.add('show');
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmNGY0ZjQiLz48dGV4dCB4PSIxNTAiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2x1xb5iYTwvdGV4dD48L3N2Zz4=';
    }

    findImageByKey(key) {
        if (!this.config.images || !key) return null;
        
        return Object.values(this.config.images).find(image => image.key === key);
    }
}

// Initialize the loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dentalClinic = new DentalClinicLoader();
});

// Global utility functions
window.dentalUtils = {
    formatPhone: (phone) => {
        return phone.replace(/(\+420)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
    },
    
    formatAddress: (address) => {
        return address.replace(/,/g, ',<br>');
    },
    
    showLoading: () => {
        document.body.classList.add('loading');
    },
    
    hideLoading: () => {
        document.body.classList.remove('loading');
    }
};
