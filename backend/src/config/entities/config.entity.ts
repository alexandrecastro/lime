import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity('config')
export class Config {
  @PrimaryColumn()
  id: string;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column('text')
  data: string;
}
