## Technologies Used

This project integrates several cloud and distributed systems technologies to build and deploy a scalable, resilient microservices-based bookstore backend.

### AWS Services
![AWS](images/aws-logo.png)

- **EC2** – Used for compute instances where necessary infrastructure components run  
- **VPC** – Defined isolated network environment  
- **CloudFormation (CF)** – Automated infrastructure provisioning and setup  

### Databases & Storage
![RDS](images/aws-rds.png)

- **MySQL on AWS RDS** – Managed relational database used for persistent data storage  

### Development Tools
![Node.js](images/nodejs-logo.png)

- **JavaScript (Node.js, Express.js)** – Used for developing all backend microservices  
- **Postman** – Used for API testing and validation  
- **Docker** – Containerized all microservices for consistent deployment environments  

### Design Patterns and Principles
![JWT](images/jwt-logo.png)

- **JWT (JSON Web Tokens)** – Used for secure user authentication and authorization  
- **BFF Pattern (Backends for Frontends)** – Enabled device-specific routing and logic separation  
- **Single Responsibility Principle** – Applied for clean code structure and service modularity  

### Cloud-Native Architecture
![Kubernetes](images/kubernetes-logo.png)
![Kafka](images/kafka-logo.png)

- **Kubernetes and Amazon EKS** – Managed container orchestration platform for scaling and monitoring services  
- **Kafka (publish-subscribe pattern)** – Used for asynchronous messaging between services  
- **Circuit Breaker and Bulkheads** – Implemented in the Book service to handle service faults gracefully and prevent cascading failures  
