## Technologies Used

This project integrates several cloud and distributed systems technologies to build and deploy a scalable, resilient microservices-based bookstore backend.

### AWS Services

- **EC2** – Used for compute instances where necessary infrastructure components run  
- **VPC** – Defined isolated network environment  
- **CloudFormation (CF)** – Automated infrastructure provisioning and setup  

### Databases & Storage

- **MySQL on AWS RDS** – Managed relational database used for persistent data storage  

### Development Tools

- **JavaScript (Node.js, Express.js)** – Used for developing all backend microservices  
- **Postman** – Used for API testing and validation  
- **Docker** – Containerized all microservices for consistent deployment environments  

### Design Patterns and Principles

- **JWT (JSON Web Tokens)** – Used for secure user authentication and authorization  
- **BFF Pattern (Backends for Frontends)** – Enabled device-specific routing and logic separation  
- **Single Responsibility Principle** – Applied for clean code structure and service modularity  

### Cloud-Native Architecture

- **Kubernetes and Amazon EKS** – Managed container orchestration platform for scaling and monitoring services  
- **Kafka (publish-subscribe pattern)** – Used for asynchronous messaging between services  
- **Circuit Breaker and Bulkheads** – Implemented in the Book service
 to handle service faults gracefully and prevent cascading failures  


<img width="423" alt="Screenshot 2025-04-30 at 10 12 37 PM" src="https://github.com/user-attachments/assets/9ed6062e-6af8-4f0a-8fdb-e0358d0b72bf" />

<img width="448" alt="Screenshot 2025-04-30 at 10 13 05 PM" src="https://github.com/user-attachments/assets/4e2a2a4f-4db6-4b1d-8dc0-83a02f60d797" />




